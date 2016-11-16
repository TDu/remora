// Entry point for Remora a web service that generates rss feeds for
// websites that do not have one.
'use strict';

var server = require('./server');

// Set things up to run on OpenShift
var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

if (typeof ipAddress === 'undefined') {
    console.log('OPENSHIFT_NODEJS_IP not found using 127.0.0.1');
    ipAddress = '127.0.0.1';
}


// Get the feeds to generate and pass them to the server
var feedsToCreate;
try {
    feedsToCreate = require('./feeds.json');
}
catch(e) {
    feedsToCreate = {};
}
server.setFeed(feedsToCreate);
// Start the server
server.listen(port, ipAddress, function() {
    console.log('Server running on port %s:%d', ipAddress, port);
});