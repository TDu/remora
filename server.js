//Generate unofficial rss feed and start a express server to serve them 
//The web server staff was officialy based on the OpenShift template.
//Because that is where I want it to run.

var express = require('express');
var request = require('request');
var rss = require('./rssmaker');
var fs = require('fs');

var app = express();

var feedLoadInterval = 600000;  //10 minutes
var feedList = {};              //List of feeds generated with their url in the app
var zcache = {};                //The cache use by the app

// Initialize the cache for the app
zcache['index.html'] = fs.readFileSync('./index.html');
// Function to get and set the cache
var zcacheGet = function(key) { return zcache[key]; };
var zcacheSet = function(key, value) {
    zcache[key] = value;
};

// Generates the rss feeds whose description is passed in parameter and stach them in the cache
var makeFeed = function(feeds) {
    var feedname;

    for ( var i=0; i < feeds.length; i++) {
        feedname = feeds[i].name;
        feedList[feedname] = "rss/" + feedname;

        (function (feed) {
            var options = {
                    url: feed.rssfeed.site_url,
                    headers: {
                        'User-Agent': 'request'
                    }
                };

            request(options, function(error, response, html){
                if(!error) {
                    console.log('Feed generated : ' + feed.name);
                    var result = rss( html, feed.rssfeed, feed.rssmaker);
                    zCacheSet(feed.name, result);
                } else {
                    console.log('Error generating feed for ' + feed.name);
                    zCacheSet(feed.name, ' something went wrong : ' + error);
                }
            });
        })(feeds[i])
    }
};

// Termination handler, terminate the server on specified signal.
var terminator = function(sig){
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating Remora.', Date(Date.now()), sig);
       process.exit(1);
    }
};
// Setup termination handlers (for exit and a list of signals).
var setupTerminationHandlers = function(){
    //  Process on exit and signals.
    process.on('exit', function() { terminator(); });
    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { terminator(element); });
    });
};

app.setFeed = function (feedsDetail) {
    makeFeed(feedsDetail);
}

setInterval(self.makeFeed(feedsToCreate), 600000);

// The route to get one of the feed generated 
app.get('/rss/:feedname', function(req, res) {
    res.send(zcacheGet(req.params.feedname));
});
// Main route
app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(zcacheGet('index.html') );
});
//Return the feed list, called by the main page in ajax
app.get('/feedlist', function(req, res) {
    res.setHeader('Content-Type', 'text/json');
    res.send(JSON.stringify(feedList));
});
// Set up static path for the server
app.use(express.static('static'));

module.exports = app;