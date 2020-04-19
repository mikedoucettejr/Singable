$(document).ready(() => {
    let lyricNum = 0;
    let allLyrics = ["I have a pet ", "It says ", "And when I play the ", "Together we make "];
    let options = [{ left: "dog", right: "rabbit" }, { left: "meow", right: "ribbit" }, { left: "piano", right: "toothbrush" }, { left: "music", right: "dinner" }];
    let song = { lyrics: "" }; // this is where each lyric will be stored as an object

    renderNextPage(allLyrics, lyricNum, options); // generates HTML for specific lyric

    // space bar reads current lyric
    // **TODO**: space bar also clicks the button you last clicked if it's still selected 
    document.body.onkeyup = function (e) {
        if (e.keyCode == 32) {
            // have to edit lyric so it reads out 'blank' rather than 'underscore' x5, and doesn't read punctuation
            let currentLyric = $(".readAloud").text().replace(/_____/, 'blank').replace(/[!:]/g, "");
            let utterThis = new SpeechSynthesisUtterance(currentLyric);
            window.speechSynthesis.speak(utterThis);
        }
    }

    $("#next").on("click", function () {
        lyricNum++;
        if (lyricNum > allLyrics.length) { // They've clicked "Play Again" on the score page
            lyricNum = 0;
            song = { lyrics: "" } // new song
            renderNextPage(allLyrics, lyricNum, options);
            $("#next").html(`Next`);
        } else { // still a "Next" button, and player is still playing
            let lyric = $(".lyric").text();
            pushLyric(lyric, song);
            if (lyricNum == allLyrics.length) { // you've completed the game!
                // **TODO**: make HTTP request with completed lyrics (`song`)
                renderLastPage();
                // **TODO**: add a "Start Over" button which would choose new set of lyrics?
            } else { // move to next page of lyrics and options
                renderNextPage(allLyrics, lyricNum, options);
                console.log(song);
            }
        }
    });
});

let pushLyric = (lyric, song) => {
    // adds a lyric to the songs object! 
    console.log("Pushing lyric");
    // does it need to be lowercase for it to be found in the dictionary @michael??
    song.lyrics += lyric + " ";
};

let setupOptionClickHandlers = (allLyrics, lyricNum) => {
    $(".left").on("click", function () {
        let word = $(".left").attr("id");
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = allLyrics[lyricNum] + word;
        $(".lyric").text(lyric);
    });
    $(".right").on("click", function () {
        let word = $(".right").attr("id");
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = allLyrics[lyricNum] + word;
        $(".lyric").text(lyric);
    });
};

let renderNextPage = (allLyrics, lyricNum, options) => {
    const $root = $('#root');
    let html = `<div>
   <p class="lyric readAloud">${allLyrics[lyricNum]}_____</p>
    </div>
    <div class="options">
            <div class="pic">
                <button class="left button" id="${options[lyricNum].left}">
                <img src="./assets/images/${options[lyricNum].left}.jpg" alt="${options[lyricNum].left}"></button>
            </div>
            <div class="pic">
                <button class="right button" id="${options[lyricNum].right}">
                <img src="./assets/images/${options[lyricNum].right}.jpg" alt="${options[lyricNum].right}"></button>
            </div>
    </div>`;
    $root.html(html);
    setupOptionClickHandlers(allLyrics, lyricNum);
};

let renderLastPage = () => {
    $('#root').html(`<div>
        <p class="lyric readAloud">Great Work!</p>
        <p class="lyric readAloud">Your score is: <span class="score readAloud">${Math.floor(Math.random() * 15000)} </span></p>
        <p class="instruction readAloud">Press play to hear your song:</p>
        <section class="player">
            <audio controls>
            <source src="./assets/audio/piano2.wav" type="audio/wav">
            </audio>
            <div class="controls">
            <button class="playpause">Play</button>
            <button class="stop">Stop</button>
            <button class="rwd">Rewind</button>
            <button class="fwd">Skip</button>
            <div class="time">00:00</div>
            </div>
        </section>
        </div>`);
    
    buildAccessibleAudio();

    // Change button to say "Play Again"
    $("#next").html(`Play Again`);
};

let buildAccessibleAudio =  function () {
    // grab references to buttons and video

    const playPauseBtn = document.querySelector('.playpause');
    const stopBtn = document.querySelector('.stop');
    const rwdBtn = document.querySelector('.rwd');
    const fwdBtn = document.querySelector('.fwd');
    const timeLabel = document.querySelector('.time');

    const player = document.querySelector('audio');

    // Remove the native controls from all players

    player.removeAttribute('controls');

    // Define constructor for player controls object

    playPauseBtn.onclick = function () {
        if (player.paused) {
            player.play();
            console.log("PLAYING!");
            playPauseBtn.textContent = 'Pause';
        } else {
            player.pause();
            playPauseBtn.textContent = 'Play';
        }
    };

    stopBtn.onclick = function () {
        player.pause();
        player.currentTime = 0;
        playPauseBtn.textContent = 'Play';
    };

    rwdBtn.onclick = function () {
        player.currentTime -= 3;
    };

    fwdBtn.onclick = function () {
        player.currentTime += 3;
        if (player.currentTime >= player.duration || player.paused) {
            player.pause();
            player.currentTime = 0;
            playPauseBtn.textContent = 'Play';
        }
    };

    player.ontimeupdate = function () {
        let minutes = Math.floor(player.currentTime / 60);
        let seconds = Math.floor(player.currentTime - minutes * 60);
        let minuteValue;
        let secondValue;

        if (minutes < 10) {
            minuteValue = "0" + minutes;
        } else {
            minuteValue = minutes;
        }

        if (seconds < 10) {
            secondValue = "0" + seconds;
        } else {
            secondValue = seconds;
        }

        mediaTime = minuteValue + ":" + secondValue;
        timeLabel.textContent = mediaTime;
    };
}