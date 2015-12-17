var express = require('express');
var app = express();
var path = require('path');
var http    = require('http');
var Twitter = require('twitter');
var net = require('net');
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(express.static('public'));
// viewed at http://localhost:8080
app.get('/', function(req, res) {
    

 
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
});
/*app.get('/', function(req, res) {
    console.log("dataa");
});*/
app.get('/author', function(req, res) {
    res.send('<h1>Sajin M Aboobakkar</h1>');
});

server.listen('3000','127.0.0.1',function(){
    console.log("Server running on "+server.address().address+":"+server.address().port);
})
/*var server= app.listen(8080,function(){
    console.log("server:",server);
});*/