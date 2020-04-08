$(document).ready(() => {
    let synth = window.speechSynthesis;

    // space bar reads current lyric
    document.body.onkeyup = function(e) {
        if (e.keyCode == 32) { 
            // have to edit lyric so it reads out 'blank' rather than 'underscore' x5
            let currentLyric = $(".lyric").text().replace(/_____/, 'blank');
            let utterThis = new SpeechSynthesisUtterance(currentLyric);
            synth.speak(utterThis);
        }
    }

    let song = {lyrics: ""}; // this is where each lyric will be stored as an object

    $(".left").on("click", function () {
        let word = $(".left").attr("id");
        synth.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
    });
    $(".right").on("click", function () {
        let word = $(".right").attr("id");
        synth.speak(new SpeechSynthesisUtterance(word));
        console.log(word);
        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
    });
    $("#next").on("click", function () {
        let lyric = $(".lyric").text();
        pushLyric(lyric, song);
        console.log(song);
    });
});

let pushLyric = (lyric, song) => {
    // adds a lyric to the songs object! 
    console.log("Pushing lyric");
    song.lyrics += lyric + " ";
};

