# Remora
> Unofficial rss feed generator

Remora is a small web service written with NodeJS and Express that generates, for personal use, basic RSS feeds for websites that do not provide one.

## How it works
Being a web service it runs on the web, I personally use a free cartridge on the OpenShift infrastructure from RedHat. But it can run anywhere.
When the appliaction starts, it reads the file feeds.json that contains the description of the RSS feeds to generate.
Then on the front page, there is a link to each RSS feed generated, which can be used in any RSS feed reader.

## How to set it up
Clone the project, change the descriptions in the feeds.json file, run it on the web.
The feeds.json contains an array of feeds description that contains :
The rssmaker section contains jQuery values that indicates where to extract information on the webpage to generates the RSS feed.
The rssfeed section which are the general desription of the feedto generate.
An example for a soundcloud podcast :

```json
{
    "name": "aintthatswell",
    "rssmaker": {
        "argument_items_section": "section",
        "argument_item": ".audible",
        "argument_item_title": "a",
        "argument_item_description": ""
    },
    "rssfeed": {
        "title": "aintthatswell on soundcloud",
        "site_url": "https://soundcloud.com/aintthatswell"
    }
},
```


## In action

The running application can be seen [here](http://remora-cachalot.rhcloud.com)


