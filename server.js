#!/bin/env node
//
var express = require('express');
var request = require('request');
var rss = require('./rssmaker');
var fs = require('fs');

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

    // Feed parameters to synch
    self.feed_param = {};
    self.feed_param.aintthatswell = {
        rssmaker: {
            argument_items_section: 'section',
            argument_item: '.audible',
            argument_item_title: 'a',
            argument_item_description: ''
        },
        rssfeed: {
            title: 'aintthatswell unofficial feed',
            site_url: 'https://soundcloud.com/aintthatswell'//,
            //image_url: ''
        }
    };
    self.feed_param.beachgrit = {
        rssmaker: {
            argument_items_section: '#ajax-filtered-section',
            argument_item: 'article',
            argument_item_title: 'h3',
            argument_item_description: 'p'
        },
        rssfeed: {
            title: 'Beachgrit unofficial feed',
            site_url: 'http://www.beachgrit.com',
            image_url: 'http://beachgrit.com/wp-content/uploads/2015/06/favicon.png'
        }
    };
    self.feed_param.wsl = {
        rssmaker: {
            argument_items_section: '.hub-layout',
            argument_item: '.content-item',
            argument_item_title: '.content-item-title',
            argument_item_description: '.content-item-description'
        },
        rssfeed: {
            title: 'World surf league unofficial feed',
            site_url: 'http://www.worldsurfleague.com',
            //image_url: 'http://beachgrit.com/wp-content/uploads/2015/06/favicon.png'
        }
    };

    // Populate the cache.
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }
        //  Local cache for static content.
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

        self.routes['/rss/beachgrit'] = function(req, res) {
            res.send(self.cache_get('beachgrit'));
        };

        self.routes['/rss/wsl'] = function(req, res) {
            res.send(self.cache_get('wsl'));
        };
        self.routes['/rss/aintthatswell'] = function(req, res) {
            res.send(self.cache_get('aintthatswell'));
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };

    self.loadFeed = function () {
        /*jshint loopfunc: true */
        for (var feedname in self.feed_param) {
            (function (feedname){
                console.log('loading ' + feedname);
                var options = {
                    url: self.feed_param[feedname].rssfeed.site_url,
                    headers: {
                        'User-Agent': 'request'
                    }
                };

                request(options, function(error, response, html){
                    if(!error) {
                        result = rss(html, self.feed_param[feedname].rssfeed, self.feed_param[feedname].rssmaker);
                        self.cache_set(feedname, result);
                    } else {
                        self.cache_set('feedname', 'Ooops something went wrong : ' + error);
                    }
            });
            
            })(feedname);
        }
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
        self.loadFeed();
        setInterval(self.loadFeed, 600000);
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