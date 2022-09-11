var points = 0;
var lifes = 3;

var postCount = 0;
var redditData = [];
var element = {};

var highscore = 0;

var streak = 0;

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
    document.getElementById("form").reset();

    document.getElementById("placeholder").innerHTML = "";
    document.getElementById("title").innerHTML = "";
    document.getElementById("description").innerHTML = "";
    document.getElementById("link").innerHTML = "";

    element = redditData.pop()

    // document.getElementById("postCount").textContent = postCount;
    document.getElementById("points").textContent = points;

    document.getElementById("streak").textContent = streak;
    document.getElementById("title").textContent = element.title;

    if (element.desc != "") {
        document.getElementById("description").textContent = element.desc;
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
        document.getElementById("placeholder").textContent = "We can not display the media at this time.";
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
        document.getElementById("description").textContent = "";
        document.getElementById("placeholder").textContent = element.desc;
    }

    document.getElementById("answer").disabled = false;
}

async function highlight(obj, color) {
    var orig = obj.style.background;
    obj.style.background = color;
    return new Promise(resolve => setTimeout(
        function() {
            obj.style.background = orig;
			document.querySelector("#answer").value = "";
			resolve();
        },
        600,
    ));
}

async function enter() {
	document.querySelector("#show").disabled = true;
	document.getElementById("streak").style.background = "";

    userInput = document.getElementById("answer").value;

	document.querySelector("#answer").value = element.sub;
	document.querySelector("#answer").disabled = true;

    if (userInput.toLowerCase() == element.sub.toLowerCase()) {
		await highlight(document.body, "#0f0");
        points++;
		streak++;
		if (streak % 5 === 0 && streak > 0) {
			document.getElementById("streak").style.background = "#0f0";

			lifes++;
			let life_div = document.createElement("div");
			life_div.innerHTML = '<div class="heart-shape"></div>';
			life_div.className = "inline pad";
			document.getElementById("lifes").appendChild(life_div);
		}
	} else {
		await highlight(document.body, "#f00");
		streak = 0;

		document.getElementById("lifes").children[0].remove();

		if (lifes === 1) {
			nh = ""
			if (points > highscore) {
				highscore = points;
				nh = " \nNew Highscore!";
			}

			alert("The game is lost. You earned " + points + " points." + nh);

			lifes = 3;
			const life_div = document.createElement("div");
			life_div.innerHTML = '<div class="heart-shape"></div>';
			life_div.className = "inline pad";
            const life_container = document.getElementById("lifes");
			life_container.appendChild(life_div.cloneNode(true));
			life_container.appendChild(life_div.cloneNode(true));
			life_container.appendChild(life_div.cloneNode(true));

			points = 0;
			streak = 0;
		} else {
			lifes--;
		}
	}

    document.getElementById("points").textContent = points;
    document.getElementById("streak").textContent = streak;


    updateSuggestions();
	getPost();

	document.querySelector("#show").disabled = false;
	document.querySelector("#answer").disabled = false;

	document.querySelector("#answer").focus();

    if (redditData.length <= 25) {
        getNextFrontpage(1);
    }
}

function updateSuggestions() {
    var subList = [];
    for (var i = 0, len = redditData.length; i < len; i++) {
        if (!subList.includes(redditData[i].sub)) {
            subList.push(redditData[i].sub);
        }
    }

    document.querySelector("#suggestions").innerHTML = "";

    for (const sub of subList) {
        var option = document.createElement('option');
        option.value = sub;
        document.getElementById("suggestions").appendChild(option);
    }
}

var after = ''
async function getNextFrontpage(pages_to_load, ordering = "") {
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

    redditData.sort(() => Math.random() - 0.5)
}

// TODO:
// - Keep game state in local storage and continue from saved state
// --> Start from top posts after certain time
// - Keep better track of highscore

function initializeGame() {
    points = 0;
    lifes = 3;
	streak = 0;

    getNextFrontpage(2)
        .then(function () {
			updateSuggestions();
            getPost();
			document.querySelector("#answer").focus();
        })
        .catch(alert);
}

document.addEventListener("DOMContentLoaded", function(event) {
    initializeGame();
})
