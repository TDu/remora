//Make an rss feed for the source code of a web page
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
                url,
                description;
            title = $(this).find(params.argument_item_title).text();
            url = $(this).find('a').attr('href');
            //Change relative links into absolute if needed
            if (url.indexOf('//') == -1) {
                url = feed_param.site_url + url;
            }
            description = $(this).find(params.argument_item_description).text();
            console.log(title, url);
            feed.item({
                title: title,
                url: url,
                //new Date(),
                description: description
            });
        });
    });
    var xmlString = feed.xml();
    return xmlString;
};

module.exports = createFeed;