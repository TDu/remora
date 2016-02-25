//
var cheerio = require('cheerio');
var rss = require('node-rss');

var createFeed = function createFeed (html, url ) {

    //Utilize cheerio to get jquery functionality
    var $ = cheerio.load(html);
    //Create the new feed
    var feed = rss.createNewFeed('Blog Most Recent',
            'http://www.beachgrit.com/',
            'Most recent blog entries from beachgrit',
            '', //author
            'http://someurl.com/rss/MostRecent.xml'
            );
    //Get the feed entries
    $('#ajax-filtered-section').filter(function () {
        $(this).find('article').each(function (index, value){
            var title,
            url,
            description;
            title = $(this).find('h3').text();
            url = $(this).find('a').attr('href');
            description = $(this).find('p').text();
            feed.addNewItem(title, url, new Date(), description, {});

        });
    });
    var xmlString = rss.getFeedXML(feed);
    return xmlString;
};

module.exports = createFeed;


