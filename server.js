#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var Twitter = require('twitter');
var http    = require('http');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            var client = new Twitter({
                consumer_key: 'p3BYDV9Zl5FJZYnY82VpFNMLc',
                consumer_secret: 'BrywTyNy99mtbqmg9nkufQnTD9YHYBP7bhA03Q9VCAm1qzezRS',
                access_token_key: '102956987-gcyN1NJ3rv2WoJY4oQQlVuZEBrsYzabR7E5HkWie',
                access_token_secret: 'pUUN1M6kj9Cw4sNtlz53CE9gzSLGJFeEUe2uEDS6QKlgl'
            });
            io.on('connection', function(socket){
                client.stream('statuses/filter', {track:'chelseafc'}, function(stream) {
                    stream.on('data', function(tweet) {
                        console.log("tweet:",tweet.text);
                        var data= {text : tweet.text,source :tweet.source,user:tweet.user.name,profile_image_url:tweet.user.profile_image_url}
                        socket.emit('tweet', { data: data});
                    });

                stream.on('error', function(error) {
                    throw error;
                });
            });

            });
            res.sendfile(path.join(__dirname + '/index.html'));
        };

        self.routes['/author'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send("<html><body>Sajin M Aboobakkar</body></html>");
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
        self.app.use(express.static('public'));
        var server = http.createServer(self.app);
        var io = require('socket.io')(server);
      //  console.log("io:",io);
        //var io = require('socket.io')(self.app);
        //  Add handlers for the app (from the routes).
        /*for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }*/
        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.app.get('/',function(req, res) {
            res.setHeader('Content-Type', 'text/html');
               
            var client = new Twitter({
                consumer_key: 'p3BYDV9Zl5FJZYnY82VpFNMLc',
                consumer_secret: 'BrywTyNy99mtbqmg9nkufQnTD9YHYBP7bhA03Q9VCAm1qzezRS',
                access_token_key: '102956987-gcyN1NJ3rv2WoJY4oQQlVuZEBrsYzabR7E5HkWie',
                access_token_secret: 'pUUN1M6kj9Cw4sNtlz53CE9gzSLGJFeEUe2uEDS6QKlgl'
            });
            io.on('connection', function(socket){
                console.log("socket:",socket);
                client.stream('statuses/filter', {track:'chelseafc'}, function(stream) {
                    stream.on('data', function(tweet) {
                        console.log("tweet:",tweet.text);
                        var data= {text : tweet.text,source :tweet.source,user:tweet.user.name,profile_image_url:tweet.user.profile_image_url}
                        socket.emit('tweet', { data: data});
                    });

                    stream.on('error', function(error) {
                        throw error;
                    });
                });
            });
            res.send(self.cache_get('index.html') );
        });

        self.app.get('/author',function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send("<html><body>Sajin M Aboobakkar</body></html>");
        });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

