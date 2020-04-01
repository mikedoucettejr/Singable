$(document).ready(() => {

    $(".left").on("click", function() { 
        let word = $(".left").attr("id");
        console.log(word);
        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
        pushLyric(lyric);
    });
    $(".right").on("click", function() { 
        let word = $(".right").attr("id");
        console.log(word);
        let lyric = "I have a pet " + word;
        $(".lyric").text(lyric);
        pushLyric(lyric);
    });
});

let pushLyric = (lyric) => {
    // will add a way to put lyric into external JSON file!
};

