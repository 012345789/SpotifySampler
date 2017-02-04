var album, tracks, currentTrack, artist;
var trackCounter = 0;

// Load album

$.ajax({
        url: "https://api.spotify.com/v1/albums/1SOzgV3thGeetKorY0IxvG",
        success: function (response) {
            album = response;
            tracks = response.tracks.items;
            artist = response.artists[0];

            // http://stackoverflow.com/q/4285042
            var img = $("<img />")
            	.attr("src", album.images[0].url)
			    .on("load", function() {
			        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
			            console.log("Failed to fetch album info.");
			        } else {
			        	img.attr("id", "album-art");
			            $("#album-art-background").append(img);
			            $("#album-art-background").addClass("gradient-styles");
			            currentTrack = tracks[trackCounter].preview_url;
			            $("#audio-track").attr("src", currentTrack);
			            $("#artist")[0].textContent = artist.name;
			            $("#song")[0].textContent = tracks[0].name;
			            changeTrack();
			        }
			    });
        }
    });

var audioTrack = $("#audio-track")[0],
    player = $("#play-pause")[0],
    forwardSkipper = $("#forward")[0],
    backwardSkipper = $("#previous")[0];

// Track seeking
// http://www.alexkatz.me/html5-audio/building-a-custom-html5-audio-player-with-javascript/

var duration;
var trackSeeker = $("#track-seeker")[0],
	trackUnplayed = $("#track-unplayed")[0],
	trackPlayed = $("#track-played")[0];

audioTrack.addEventListener("timeupdate", updatePlayed, false);

function updatePlayed() {
	var playPercent = 100 * (audioTrack.currentTime / duration);
	trackPlayed.style.width = playPercent + "%";
	trackUnplayed.style.width = (100 - playPercent) + "%";
	$("#duration-played")[0].textContent = secToMinSec(audioTrack.currentTime);

	if (playPercent >= 100) {
		if (trackCounter < tracks.length - 1) {
			trackCounter++;
			changeTrack();
		} else {
			trackCounter = 0;
			changeTrack();
			audioTrack["pause"]();
			$("#play-pause").removeClass("fa-pause"); 
    		$("#play-pause").addClass("fa-play");
		}
	}
}

// Gets audio file duration
audioTrack.addEventListener("canplaythrough", function () {
	duration = audioTrack.duration;
	$("#duration-total")[0].textContent = secToMinSec(audioTrack.duration);
	$("#duration-played")[0].textContent = "0:00"; // to prevent style flash
}, false);

trackSeeker.addEventListener("click", function (event) {
	if (audioTrack && duration) {
		var currentTime = duration * clickPercent(event);
		audioTrack.currentTime = currentTime;
	}

	updatePlayed();
}, false);

// Play/pause

player.onclick = function () {

    // Update the Button
    var pause = player.status === 'paused!';

    if (pause) {
    	$("#play-pause").removeClass("fa-pause"); 
    	$("#play-pause").addClass("fa-play");
    } else {
    	$("#play-pause").removeClass("fa-play");
    	$("#play-pause").addClass("fa-pause");
    }

    // Update the Audio
    var mode = pause ? 'pause' : 'play';
    audioTrack[mode]();

    player.status = pause ? 'playing!' : 'paused!';

    // Prevent Default Action
    return false;
};

// Skip forward and backward

forwardSkipper.onclick = function() { 
	if (trackCounter < tracks.length - 1) {
		trackCounter++;
		changeTrack()
	}
};

backwardSkipper.onclick = function() {
	if (trackCounter > 0){
		trackCounter--;
		changeTrack();
	}
}

// Utility functions

function changeTrack() {
	var currStatus = player.status;

	currentTrack = tracks[trackCounter].preview_url;

	$("#audio-track").attr("src", currentTrack);
	$("#song")[0].textContent = tracks[trackCounter].name;

	var mode = currStatus == "paused!" ? 'play' : 'pause';
    audioTrack[mode]();

    // Invalidate backward/forward skipper if there is no previous/next song
    if (trackCounter === 0) {
    	$("#previous").removeClass("valid-control");
    	$("#previous").addClass("invalid-control");
    } else {
    	$("#previous").removeClass("invalid-control");
    	$("#previous").addClass("valid-control");
    }
    
    if (trackCounter === tracks.length -1) {
    	$("#forward").removeClass("valid-control");
    	$("#forward").addClass("invalid-control");
    } else {
    	$("#forward").removeClass("invalid-control");
    	$("#forward").addClass("valid-control");
    }

    return false;
}

function clickPercent(e) {
	var offset = $("#track-seeker").offset();
	var width = $("#track-seeker").width(); 
	// the above two lines can be moved out of this function, but for readability they will be left inside
	var clickPercentage = (e.pageX - offset.left) / width;
	return clickPercentage;
}

function secToMinSec(secs) {
	var min = Math.round((secs/60) << 0);
   	var sec = Math.round(secs % 60);
   	var fmtSec = sec >= 10 ? sec : "0" + sec;
   	return min + ":" + fmtSec;
}

