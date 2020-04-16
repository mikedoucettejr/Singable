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
                 // generate random score
                $('#root').html(`<div>
                <p class="lyric readAloud">Great Work!</p>
                <p class="lyric readAloud">Your score is:</p>
                <p class="score readAloud">${Math.floor(Math.random() * 15000)}</p>
                </div>`);
                console.log(song);
                // Change button to say "Play Again"
                $("#next").html(`Play Again`); 
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
                <button class="left" id="${options[lyricNum].left}">
                <img src="./assets/images/${options[lyricNum].left}.jpg" alt="${options[lyricNum].left}"></button>
            </div>
            <div class="pic">
                <button class="right" id="${options[lyricNum].right}">
                <img src="./assets/images/${options[lyricNum].right}.jpg" alt="${options[lyricNum].right}"></button>
            </div>
    </div>`;
    $root.html(html);
    setupOptionClickHandlers(allLyrics, lyricNum);
};
