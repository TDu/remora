//
var cheerio = require('cheerio');
var RSS = require('rss');

var createFeed = function createFeed (html, url ) {

    //Utilize cheerio to get jquery functionality
    var $ = cheerio.load(html);
    //Create the new feed
    //var feed = rss.createNewFeed('Blog Most Recent',
            //'http://www.beachgrit.com/',
            //'Most recent blog entries from beachgrit',
            //'', //author
            //'http://someurl.com/rss/MostRecent.xml'
            //);
    var feed= new RSS({
        title: 'Beachgrit rss'
    });

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
    var xmlString = feed.xml();//rss.getFeedXML(feed);
    return xmlString;
};

module.exports = createFeed;


