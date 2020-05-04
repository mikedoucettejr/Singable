$(document).ready(() => {
    let lyricNum = 0;
    let allLyrics = ["I have a pet ", "It says ", "And when I play the ", "Together we make "];
    let options = generateRandomOptions();
    let choices = []; // keep track of each choice made
    let song = { lyrics: "" }; // this is where each lyric will be stored as an object

    renderNextPage(allLyrics, lyricNum, options, choices); // generates HTML for specific lyric

    // up arrow reads current lyric, left arrow reads left option, right arrow reads right option
    document.body.onkeyup = function (e) {
        if (e.keyCode == 38) { // up arrow 
            // have to edit lyric so it reads out 'blank' rather than 'underscore' x5, and doesn't read punctuation
            e.preventDefault();
            let currentLyric = $(".readAloud").text().replace(/_____/, 'blank').replace(/[!:]/g, "");
            let utterThis = new SpeechSynthesisUtterance(currentLyric);
            window.speechSynthesis.speak(utterThis);
        }
        if (e.keyCode == 37) { // left arrow 
            let leftOption = $(".left").attr("id");
            let utterThis = new SpeechSynthesisUtterance(leftOption);
            window.speechSynthesis.speak(utterThis);
        }
        if (e.keyCode == 39) { // right arrow 
            let rightOption = $(".right").attr("id");
            let utterThis = new SpeechSynthesisUtterance(rightOption);
            window.speechSynthesis.speak(utterThis);
        }
    }

    $("#next").on("click", function () {
        lyricNum++;
        if (lyricNum > allLyrics.length) { // They've clicked "Play Again" on the score page
            lyricNum = 0;
            song = { lyrics: "" } // new song
            renderNextPage(allLyrics, lyricNum, options, choices);
            $("#next").html(`Next`);
        } else { // still a "Next" button, and player is still playing
            let lyric = $(".lyric").text();
            pushLyric(lyric, song);
            if (lyricNum == allLyrics.length) { // you've completed the game!
                renderLastPage(choices);
                options = generateRandomOptions(); // randomize options for next game
            } else { // move to next page of lyrics and options
                renderNextPage(allLyrics, lyricNum, options, choices);
                console.log(song);
            }
        }
    });
});

let generateRandomOptions = () => {
    let shuffledOptions = shuffle(["dog", "dinosaur", "donut", "ribbit", "piano", "toothbrush", "music", "dinner"]);
    let optionObjects = [];
    let j = 0;
    for (let i = 0; i < 4; i++) {
        optionObjects[i] = { left: shuffledOptions[j], right: shuffledOptions[j+1] };
        j+=2;
    }
    return optionObjects;
}

let shuffle = (a) => {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
};

let pushLyric = (lyric, song) => {
    // adds a lyric to the songs object! 
    console.log("Pushing lyric");
    song.lyrics += lyric + " ";
};

let setupOptionClickHandlers = (allLyrics, lyricNum, choices) => {
    $(".left").on("click", function () {
        let word = $(".left").attr("id");
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = allLyrics[lyricNum] + word;
        choices[lyricNum] = word;
        $(".lyric").text(lyric);
    });
    $(".right").on("click", function () {
        let word = $(".right").attr("id");
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = allLyrics[lyricNum] + word;
        choices[lyricNum] = word;
        $(".lyric").text(lyric);
    });
};

let setupHelpButton = (pageType) => {
    $(".help").on("click", function () {
        if (pageType == "regular") {
            // show menu for up arrow reading lyric, left reading left, right reading right
            console.log(pageType);
            // replace .helpbox with text of menu
        } else if (pageType == "last") {
            // show menu for up button reading page
            console.log(pageType);
        }
    });
};

let renderNextPage = (allLyrics, lyricNum, options, choices) => {
    const $root = $('#root');
    let html = ` <header><h1 class="lyric readAloud">${allLyrics[lyricNum]}_____</h1></header>
    <div class="helpbox"><button class="help">?</button></div>
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
    setupOptionClickHandlers(allLyrics, lyricNum, choices);
    setupHelpButton("regular");
};

let renderLastPage = (choices) => {
    let fileName = "";
    for (let i = 0; i < choices.length; i++) {
        if (i < choices.length - 1) {
            fileName += choices[i] + "-";
        } else {
            fileName += choices[i];
        }
    }
    console.log(fileName);

    $('#root').html(`<div>
        <div class="helpbox"><button class="help">?</button></div>
        <p class="lyric readAloud">Great Work!</p>
        <p class="lyric readAloud">Your score is: <button class="score">${Math.floor(Math.random() * 15000)} </button></p>
        <p class="instruction readAloud">Press play to hear your song:</p>
        <section class="player">
            <audio controls>
            <source src="./assets/audio/${fileName}.wav" type="audio/wav">
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
    
    $(".score").on("click", function () {
        let score = $(".score").text();
        let utterThis = new SpeechSynthesisUtterance(score);
        window.speechSynthesis.speak(utterThis);
    });

    setupHelpButton("last");
    buildAccessibleAudio();

    // Changes   button to say "Play Again"
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