#!/bin/env node
//Generate unofficial rss feed and start a express server to serve them 
//The web server staff was officialy based on the OpenShift template.
//Because that is where I want it to run.

var express = require('express');
var request = require('request');
var rss = require('./rssmaker');
var fs = require('fs');
var feedsToCreate = require('./feeds.json');

var SampleApp = function() {

    var self = this;

    self.feedLoadInterval = 600000; //10 minutes

    // Set up server IP address and port # using env variables/defaults.
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };

    //List of feeds automatically generated
    self.feed_list = {};

    self.routes = { };

    // Populate the cache.
    self.populateCache = function() {
        // Create the cache object
        if (typeof self.zcache === "undefined") {
            self.zcache = {};
        }
        // Initialize cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };

     /* Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };

    self.cache_set = function(key, value) {
        self.zcache[key] = value;
    };

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

    // Setup termination handlers (for exit and a list of signals).
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

    // Create the routing table entries + handlers for the application.
    self.createRoutes = function() {

        // To check the cache, this is for debug
        /*
        /self.routes['/cache'] = function(req, res) {
            console.log(req.url);
            res.send(self.zcache);
        };
        */

        // The route to get one of the feed generated 
        self.routes['/rss/:feedname'] = function(req, res) {
            res.send(self.cache_get(req.params.feedname));
        };
        // Main route
        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
        //Return the feed list, called by the main page in ajax
        self.routes['/feedlist'] = function(req, res) {
            res.setHeader('Content-Type', 'text/json');
            res.send(JSON.stringify(self.feed_list));
        }
    };

    // Initialize the server (express) and create the routes and register the handlers.
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };

    // Generates the rss feeds whose description is passed in parameter and stach them in the cache
    self.makeFeed = function(feeds) {
        var feedname;

        for ( var i=0; i < feeds.length; i++) {
            feedname = feeds[i].name;
            self.feed_list[feedname] = "rss/" + feedname;

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
                        self.cache_set(feed.name, result);
                    } else {
                        console.log('Error generating feed for ' + feed.name);
                        self.cache_set(feed.name, ' something went wrong : ' + error);
                    }
                });
            })(feeds[i])
        }
    };

    // Initializes the sample application.
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();

        self.makeFeed(feedsToCreate);
        //setInterval(self.makeFeed(feedsToCreate), 600000);

        self.setupTerminationHandlers();
        // Create the express server and routes.
        self.initializeServer();
    };

    // Start the server (starts up the sample application).
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
        self.app.use(express.static('static'));
    };
};

var zapp = new SampleApp();
zapp.initialize();
zapp.start();