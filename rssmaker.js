//Make an rss feed for a web page
var cheerio = require('cheerio');
var RSS = require('rss');

var createFeed = function createFeed (html, feed_param ) {

    //Utilize cheerio to get jquery functionality
    var $ = cheerio.load(html);
    //Create the new feed
    var feed= new RSS(feed_param);
    //Get the feed entries
    $('#ajax-filtered-section').filter(function () {
        $(this).find('article').each(function (index, value){
            var title,
                url,
                description;
                title = $(this).find('h3').text();
                url = $(this).find('a').attr('href');
                description = $(this).find('p').text();
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
