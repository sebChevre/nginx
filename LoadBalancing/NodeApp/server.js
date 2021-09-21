var express =require('express');
var fs = require('fs');
var os = require('os');
var app = express();

app.get('/',function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('index.html', function (err,data) {
        res.end(data);
    });
});

app.get('/api/hostname', function(req,res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({hostname: os.hostname()}));
});

app.listen(8080);

console.log('Server running at ' + os.hostname());
