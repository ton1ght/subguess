var index
var points = 0
var hint = 0
var hints = 3
var lives = 10

var postCount = 0;
var redditData = [];

function getPost() {
    hint = 0;


    document.getElementById("form").reset();
    $("#placeholder").html("");
    $("#title").html("");
    $("#description").html("");
    $("#link").html("");

    index = Math.floor(Math.random()*postCount)

    document.getElementById("postCount").innerHTML = postCount
    document.getElementById("hints").innerHTML = hints
    document.getElementById("lives").innerHTML = lives
    document.getElementById("points").innerHTML = points
    document.getElementById("title").innerHTML = redditData[index].title;

    if(redditData[index].desc != "" && !redditData[index].desc.includes("https")){
        document.getElementById("description").innerHTML = redditData[index].desc;
    }
// https://i.imgur.com/hqgwqFO.gifv
    // this if covers images
    if (redditData[index].url.includes("i.redd.it") || redditData[index].url.includes("gfycat") || (redditData[index].url.includes("imgur") && !redditData[index].url.includes("gifv"))){
        var x = document.createElement("img");
        x.setAttribute("src", redditData[index].url);
        x.setAttribute("onerror","this.style.display='none'");
        document.getElementById("placeholder").appendChild(x);
    // this if covers vidoes
    } else if(redditData[index].url.includes("v.redd.it")){
        var video = document.createElement('video');
        video.src = redditData[index].vid;
        video.type = "video/mp4"
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        document.getElementById("placeholder").appendChild(video);
    } else if (redditData[index].url.includes(".gifv")) {
        console.log(redditData[index].url);
        newString = redditData[index].url.replace(".gifv", ".mp4");
        console.log(newString);
        var video = document.createElement('video');
        video.src = newString;
        video.type = "video/mp4"
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.controls = true;
        document.getElementById("placeholder").appendChild(video);
    // this if covers text
    } else if(!redditData[index].url.includes("reddit")){
        var hyperlink = document.createElement('a');
        hyperlink.href = redditData[index].url
        hyperlink.innerText = redditData[index].url
        document.getElementById("link").appendChild(hyperlink);
    }
}

function highlight(obj, color){
    var orig = obj.style.background;
    obj.style.background = color;
    setTimeout(
        function(){
            obj.style.background = orig;
        },
        500
    );
}

function skip(){
    if (!checkInput()) {
        lives = lives - 1;
        if (lives == 0){
            gameLost();
        }
        getPost();
    }
    getPost();
}

function gameLost(){
    window.location.replace('./end.html')
    window.addEventListener('load', function () {
        alert(points)
        document.getElementById("score").innerHTML = points
    })
}

function checkInput(){
    userInput = document.getElementById("answer").value;
    document.getElementById("form").reset();
    if (userInput.toUpperCase() == redditData[index].sub.toUpperCase()) {
        highlight(document.getElementById("answer"), '#0f0');
        return true;
    } else {
        highlight(document.getElementById("answer"), '#f00');
        return false;
    }
}

function enter() {
    if (checkInput()) {
        if(hint == 0){
            points = points + 1
        }
        redditData.splice(index, 1)
        postCount--
        getPost();
    } else {
        lives = lives - 1;
        if (lives == 0){
            gameLost();
        }
    }
    document.getElementById("lives").innerHTML = lives
}

function showSolution(){
    hint = 1
    if (hints > 0){
        document.getElementById("answer").value = redditData[index].sub
        hints = hints - 1;
        document.getElementById("hints").innerHTML = hints
    }
    return 1;
}

function getSuggestions(){
    let subList = []
    for (var i = 0, len = redditData.length; i < len; i++) {
        subList.push(redditData[i].sub)
    }

    sub_list = new Set(subList)

    for (var i = 0, len = subList.length; i < len; i++) {
       var option = document.createElement('option');
       option.value = subList[i];
       document.getElementById("suggestions").appendChild(option);
    }
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

var next = function(after, j, _callback) {
    if (j == 0) {
        _callback();
        return 0;
    }

    getJSON('https://www.reddit.com/.json?callback=foo&after=' + after, function(_, data) {
        for (var i = 0; i < 25; i++) {
            postCount += 1;
            try {
                redditData.push(
                    {
                        url : data.data.children[i].data.url,
                        sub : data.data.children[i].data.subreddit,
                        title : data.data.children[i].data.title,
                        desc : data.data.children[i].data.selftext,
                        vid : data.data.children[i].data.media.reddit_video.fallback_url
                    }
                );
            } catch(err) {
                redditData.push(
                    {
                        url : data.data.children[i].data.url,
                        sub : data.data.children[i].data.subreddit,
                        title : data.data.children[i].data.title,
                        desc : data.data.children[i].data.selftext,
                        vid : ''
                    }
                );
            }
        }

        next(data.data.after, j-1, _callback);
    });
}

var finishedCount = 4;
function getFrontpage(_callback){
    next('', 4, _callback);
}

function initializeGame() {
    getFrontpage(
        function () {
            getPost();
            getSuggestions();
        }
    );
}

document.addEventListener("DOMContentLoaded", function(event) {
    initializeGame();
});
