//Make an rss feed from the source code of a web page
var cheerio = require('cheerio');
var RSS = require('rss');

// Make sure a url is absolute
var makeAbsoluteUrl = function(siteUrl, url) {
    var rootUrl;

    //console.log('url : ' + url);
    if (url.indexOf('//') == -1) {
        // Not an absolute url, lets change that
        //get the root url from the site url
        if (siteUrl.indexOf('://') > -1) {
            rootUrl = siteUrl.substr(0,siteUrl.indexOf('/', 8));
        } else {
            rootUrl = siteUrl.substr(0,siteUrl.indexOf('/', 1));
        }
        url = rootUrl + url;
    }
    //console.log('  ---> ' + url);
    return url;
};

var createFeed = function createFeed (html, feed_param, params) {
    var $ = cheerio.load(html),     //Use cheerio to get jquery functionality
        feed= new RSS(feed_param);  //Create the new rss feed

    // Find the block containing the detail for the rss feed
    $(params.argument_items_section).filter(function () {
        // Find the block for each rss item
        $(this).find(params.argument_item).each(function (index, value){
            var title,
                url,
                description;

            title = $(this).find(params.argument_item_title).text();
            url = $(this).find('a').attr('href');
            description = $(this).find(params.argument_item_description).text();
            //Change relative links into absolute if needed
            url = makeAbsoluteUrl(feed_param.site_url, url);
            //Add the new entry to the feed
            feed.item({
                title: title,
                url: url,
                description: description
            });
        });
    });
    return feed.xml();
};

module.exports = createFeed;