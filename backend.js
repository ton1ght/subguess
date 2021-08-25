var index
var points = 0
var hint = 0
var skips = 3
var lifes = 5

var postCount = 0;
var redditData = [];

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

    if (redditData[index].desc != "" && !redditData[index].desc.includes("https")) {
        document.getElementById("description").innerHTML = redditData[index].desc;
    }
    // images
    if (redditData[index].url.includes("i.redd.it") || (redditData[index].url.includes("imgur") && !redditData[index].url.includes("gifv"))) {
        var x = document.createElement("img");
        x.setAttribute("src", redditData[index].url);
        x.setAttribute("onerror","this.style.display='none'");
        document.getElementById("placeholder").appendChild(x);
    // gfycat
    } else if (redditData[index].url.includes("gfycat")) {
        var video = document.createElement('video');
        video.src = redditData[index].vid + ".gif";
        video.type = "video/mp4";
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        document.getElementById("placeholder").appendChild(video);
    // videos
    } else if (redditData[index].url.includes("v.redd.it")) {
        var video = document.createElement('video');
        video.src = redditData[index].vid;
        video.type = "video/mp4";
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        document.getElementById("placeholder").appendChild(video);
    // gifs
    } else if (redditData[index].url.includes(".gifv")) {
        newString = redditData[index].url.replace(".gifv", ".mp4");
        var video = document.createElement('video');
        video.src = newString;
        video.type = "video/mp4";
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        document.getElementById("placeholder").appendChild(video);
    // text
    } else if (redditData[index].url.includes("twitter")) {
        link = "https://twitframe.com/show?url=" + encodeURI(redditData[index].url);
        var hyperlink = document.createElement('a');
        hyperlink.href = link;
        hyperlink.innerText = redditData[index].url;
        document.getElementById("link").appendChild(hyperlink);

        let ifrm = document.createElement('iframe');
        ifrm.setAttribute("src", link);
        document.getElementById("placeholder").appendChild(ifrm);

    } else if(!redditData[index].url.includes("reddit")) {
        var hyperlink = document.createElement('a');
        hyperlink.href = redditData[index].url;
        hyperlink.innerText = redditData[index].url;
        document.getElementById("link").appendChild(hyperlink);

        let ifrm = document.createElement('iframe');
        ifrm.setAttribute("src", redditData[index].url);
        document.getElementById("placeholder").appendChild(ifrm);
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

async function getFrontpage(pages_to_load) {
    let after = '';
    for (let j = 0; j < pages_to_load; j++) {
        await fetch('https://www.reddit.com/.json?callback=foo&after=' + after)
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
