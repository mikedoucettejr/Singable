$(document).ready(() => {
    let synth = window.speechSynthesis;

    // read aloud the blank lyric
    $("#speak").on("click", function() { 
        // have to edit lyric so it reads out 'blank' rather than 'underscore' x5
        let currentLyric = $(".lyric").text().replace(/_____/, 'blank'); 
        let utterThis = new SpeechSynthesisUtterance(currentLyric);
        synth.speak(utterThis);
    });
    
    let songs = [{}]; // this is where each lyric will be stored as an object
    let state = {songID: 0, lyricCount: 0};
    // all objects with same songID belong to the same song

    $(".left").on("click", function() { 
        let word = $(".left").attr("id");
        synth.speak(new SpeechSynthesisUtterance(word));
        console.log(word);

        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
        state = pushLyric(lyric, songs, state);
        // console.log(songs);
        // console.log(state);
    });
    $(".right").on("click", function() { 
        let word = $(".right").attr("id");
        synth.speak(new SpeechSynthesisUtterance(word));
        console.log(word);

        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
        state = pushLyric(lyric, songs, state);
        // console.log(songs);
        // console.log(state);
    });
});

let pushLyric = (lyric, songs, state) => {
    // adds a lyric to the songs object! 
    console.log("Pushing lyric");
    songs[state.lyricCount] = {
        id: state.songID,
        lyric: lyric
    };
    state.lyricCount++;
    return state;
};

