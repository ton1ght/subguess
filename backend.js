var index
var points = 0
var hint = 0
var hints = 3
var lives = 10

var postCount = 0;
var urls = new Object();
var descriptions = new Object();
var titles = new Object();
var fallback_urls = new Object();
var subreddits = new Object();

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
        document.getElementById("title").innerHTML = titles[index]

        if(descriptions[index] != "" && !descriptions[index].includes("https")){
            document.getElementById("description").innerHTML = descriptions[index]
        }

        if (urls[index].includes("i.redd.it") || urls[index].includes("gyfcat")){
            var x = document.createElement("img");
            x.setAttribute("src",urls[index]);
            x.setAttribute("onerror","this.style.display='none'");
            document.getElementById("placeholder").appendChild(x);
        }else if(urls[index].includes("v.redd.it")){
            var video = document.createElement('video');
            video.src = fallback_urls[index];
            video.type = "video/mp4"
            video.autoplay = true;
            video.loop = true;
            document.getElementById("placeholder").appendChild(video);
        }else if(!urls[index].includes("reddit")){
            var hyperlink = document.createElement('a');
            hyperlink.href=urls[index]
            hyperlink.innerText = urls[index]
            document.getElementById("link").appendChild(hyperlink);
        }
}

function highlight(obj,color){
   var orig = obj.style.background;
   obj.style.background = color;
   setTimeout(function(){
        obj.style.background = orig;
   }, 500);
}

function skip(){
    lives-=1
    if (lives == 0){
        gameLost();
    }else{
        getPost();
    }
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
    if (userInput.toUpperCase() == subreddits[index].toUpperCase()){
        highlight(document.getElementById("answer"), '#0f0');
        if(hint == 0){
            points = points + 1
        }
        getPost();
    }
    else{
        highlight(document.getElementById("answer"), '#f00');
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
        document.getElementById("answer").value = subreddits[index]
        hints = hints - 1;
        document.getElementById("hints").innerHTML = hints
    }
    return 1;
}

function getSuggestions(){
    for (var i = 0, len = urls.length; i < len; i++) {
       var option = document.createElement('option');
       option.value =urls[i];
       document.getElementById("suggestions").appendChild(option);
    }
}

function getFrontpage(){
    $.getJSON('https://reddit.com/.json?callback=foo').then(function(data) {
        for (var i = 0, len = data.data.children.length; i < len; i++) {
            postCount+=1;
            urls[i] = data.data.children[i].data.url;
            subreddits[i] = data.data.children[i].data.subreddit;
            titles[i] = data.data.children[i].data.title;
            descriptions[i] = data.data.children[i].data.selftext;
            try{
                fallback_urls[i] = data.data.children[i].data.media.reddit_video.fallback_url
            }catch(err){
                fallback_urls[i] = ""
            }
        }
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
    getFrontpage();
    getSuggestions();
    getPost();
});
