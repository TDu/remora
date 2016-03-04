//Make an rss feed from the source code of a web page
var cheerio = require('cheerio');
var RSS = require('rss');

var createFeed = function createFeed (html, feed_param, params) {
    //Utilize cheerio to get jquery functionality
    var $ = cheerio.load(html);
    //Create the new feed
    var feed= new RSS(feed_param);
    //Get the feed entries
    $(params.argument_items_section).filter(function () {
        $(this).find(params.argument_item).each(function (index, value){
            var title,
                site_url,
                url,
                description,
                rootUrl;

            title = $(this).find(params.argument_item_title).text();
            url = $(this).find('a').attr('href');
            description = $(this).find(params.argument_item_description).text();
            //Change relative links into absolute if needed
            site_url = feed_param.site_url;
            if (url.indexOf('//') == -1) {
                //get the root url from the site url
                if (feed_param.site_url.indexOf('://') > -1) {
                    rootUrl = site_url.substr(0,site_url.indexOf('/', 8));
                } else {
                    rootUrl = site_url.substr(0,site_url.indexOf('/', 1));
                }
                url = rootUrl + url;
            }
            //console.log(title, url);
            //Add the new entry to the feed
            feed.item({
                title: title,
                url: url,
                //new Date(),
                description: description
            });
        });
    });
    //Create the feed
    return feed.xml();
};

module.exports = createFeed;