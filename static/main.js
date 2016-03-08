(function () {
    console.log("Javascript loaded.");
    //Load the list of rss feed generated
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            console.log('Received the payload : ');
            console.log(xmlHttp.responseText);
            //Display the list of rss feed to the user
            var feedlist = JSON.parse(xmlHttp.responseText);
            var ul = document.getElementById('feedlist');
            for (var feed in feedlist) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.setAttribute('href', feedlist[feed]);
                a.innerHTML = feed;
                //li.appendChild(document.createTextNode(feed));
                li.appendChild(a);
                ul.appendChild(li);
                }
        }
    }
    xmlHttp.open("GET", "/feedlist", true)
    xmlHttp.send(null);
})();