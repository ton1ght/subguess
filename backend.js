var index
var points = 0
var hint = 0
var skips = 3
var lifes = 5

var postCount = 0;
var redditData = [];

function contains_all(str, search) {
    ret = 0;
    search.forEach(word => ret += str.includes(word));
    return (ret === search.length);
}

function contains_one(str, search) {
    for (const word of search) {
        if (str.includes(word)) {
            return true;
        }
    }
    return false;
}

function getPost(debug_index = null) {
    hint = 0;

    document.getElementById("form").reset();
    $("#placeholder").html("");
    $("#title").html("");
    $("#description").html("");
    $("#link").html("");

    index = (debug_index === null) ? Math.floor(Math.random()*postCount) : debug_index;

    document.getElementById("postCount").innerHTML = postCount;
    document.getElementById("lifes").innerHTML = lifes;
    document.getElementById("points").innerHTML = points;
    document.getElementById("skips").innerHTML = skips;
    document.getElementById("title").innerHTML = redditData[index].title;

    let element = redditData[index];

    if (element.desc != "") {
        document.getElementById("description").innerHTML = element.desc;
    }

    if (contains_one(element.vid, ["v.redd.it", ".gifv"])) {
        let video_url = element.url.includes("v.redd.it") ? element.vid + ".gif" : element.url.replace(".gifv", ".mp4");
        let video = document.createElement('video');
        video.src = element.vid;
        video.type = "video/mp4";
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        document.getElementById("placeholder").appendChild(video);

    } else if (contains_one(element.url, ["i.redd.it", "imgur"])) {
        let x = document.createElement("img");
        x.setAttribute("src", element.url);
        x.setAttribute("onerror", "this.style.display='none'");

        document.getElementById("placeholder").appendChild(x);

    } else if (element.url.includes("twitter")) {
        let iframe_url = "https://twitframe.com/show?url=" + encodeURI(element.url);

        var hyperlink = document.createElement('a');
        hyperlink.href = element.url;
        hyperlink.innerText = element.url;
        hyperlink.target = "_blank";
        document.getElementById("link").appendChild(hyperlink);

        let ifrm = document.createElement('iframe');
        ifrm.setAttribute("src", iframe_url);
        document.getElementById("placeholder").appendChild(ifrm);

    } else if (element.url.includes("gfycat") || contains_all(element.url, ["gallery", "reddit"])) {
        document.getElementById("placeholder").innerHTML = "We can not display the media at this time.";
        var hyperlink = document.createElement('a');
        hyperlink.href = element.url;
        hyperlink.innerText = element.url;
        hyperlink.target = "_blank";
        document.getElementById("link").appendChild(hyperlink);

    } else if (element.url != "" && !element.url.includes("reddit")) {
        var hyperlink = document.createElement('a');
        hyperlink.href = element.url;
        hyperlink.innerText = element.url;
        hyperlink.target = "_blank";
        document.getElementById("link").appendChild(hyperlink);

    } else {
        document.getElementById("description").innerHTML = "";
        document.getElementById("placeholder").innerHTML = element.desc;
    }

    return index;
}

function highlight(obj, color) {
    var orig = obj.style.background;
    obj.style.background = color;
    setTimeout(
        function() {
            obj.style.background = orig;
        },
        1000,
    );
}

function skip() {
    if (skips > 0) {
        skips = skips - 1
        getPost()
        if (skips <= 0) {
            document.getElementById("button_skip").disabled = true;
        }
    }
}

function gameLost() {
    window.location.replace('./end.html');
    window.addEventListener('load', function () {
        alert(points);
        document.getElementById("score").innerHTML = points;
    })
}

function checkInput() {
    userInput = document.getElementById("answer").value;
    document.getElementById("form").reset();
    if (userInput.toLowerCase() == redditData[index].sub.toLowerCase()) {
        highlight(document.getElementById("answer"), '#0f0');
        return true;
    } else {
        highlight(document.getElementById("answer"), '#f00');
        return false;
    }
}

function enter() {
    if (checkInput()) {
        if (!hint) {
            points = points + 1;
        }
        redditData.splice(index, 1)
        postCount = postCount - 1;
        getPost();
    } else {
        decreaseLifes();
    }
    document.getElementById("lifes").innerHTML = lifes;
}

function getSuggestions() {
    let subList = [];
    for (var i = 0, len = redditData.length; i < len; i++) {
        if (!subList.includes(redditData[i].sub)) {
            subList.push(redditData[i].sub);
        }
    }

    for (var i = 0, len = subList.length; i < len; i++) {
       var option = document.createElement('option');
       option.value = subList[i];
       document.getElementById("suggestions").appendChild(option);
    }
}

function decreaseLifes() {
    lifes = lifes - 1;
    if (lifes <= 0) {
        gameLost();
    }
}

async function getFrontpage(pages_to_load, ordering = "") {
    let after = '';

    if (!["hot", "new", "top", "rising"].includes(ordering)) {
        ordering = "";
    } else {
        ordering += "/";
    }

    for (let j = 0; j < pages_to_load; j++) {
        await fetch('https://www.reddit.com/' + ordering + '.json?callback=foo&after=' + after)
            .then(response => response.json())
            .then(function (json) {
                for (let i = 0; i < 25; i++) {
                    postCount += 1;
                    try {
                        redditData.push(
                            {
                                url   : json.data.children[i].data.url,
                                sub   : json.data.children[i].data.subreddit,
                                title : json.data.children[i].data.title,
                                desc  : json.data.children[i].data.selftext,
                                vid   : json.data.children[i].data.media.reddit_video.fallback_url
                            }
                        );
                    } catch(err) {
                        redditData.push(
                            {
                                url   : json.data.children[i].data.url,
                                sub   : json.data.children[i].data.subreddit,
                                title : json.data.children[i].data.title,
                                desc  : json.data.children[i].data.selftext,
                                vid   : ''
                            }
                        );
                    }
                }

                after = json.data.after;
            }
        );
    }
}

function initializeGame() {
    getFrontpage(4)
        .then(function () {
            getPost();
            getSuggestions();
        })
        .catch(alert)
}

document.addEventListener("DOMContentLoaded", function(event) {
    initializeGame();
})
