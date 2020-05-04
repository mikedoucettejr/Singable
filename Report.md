## Singable

### Description of the Project
Singable is a songwriting game where the player chooses words to fill in the blanks of a series of lyrics.  After filling in the blanks of all the lyrics, they can hear their song played back to them!  The song is actually a series of MIDI notes that are generated based on the number of syllables in each word of the lyric.  A voice that reads the lyrics is layered on top of this song and the beats are aligned to create a track that sounds like music should, with notes and voice in sync.  

A huge "Singable Score" is included at the end to provide encouragement to the player.  It doesn't really have any meaning, but hopefully it will make the player feel like they've done a great job! The player can then choose to play again, and this will create a new game where the options for each lyric are randomly selected, meaning that there are many unique songs that the player can create. 

### Intended Audience
We tried to design a game that includes children with various disabilities. Our game is made for anyone who wants to ‘sing’ along to music that normally cannot, primarly children with vocal impairments. It's also built for childen with visual impairments because it's compliant with accessibility devices (according to the WAVE evaluator), and every lyric and picture option can be read aloud by clicking buttons.  Lastly, the game is designed to include children with cognitive impairments because the gameplay will be as simple as possible, and pictures will be used as additional cues.

Beyond this intended audience, the game could be fun for adults with any of these impairments, or children without impairments, given the playful nature of the lyrics.

### The Technologies, Frameworks, and Libraries used
For the front end, we used JS and JQuery, as well as the web speech API called SpeechSynthesisUtterance to read the elements of the webpage aloud.  


For the backend web server that generates the audio file (made up of voice and MIDI) see: https://github.com/ross-dib/Melody-Generator-API/. The server's API was setup using Flask, and the MIDI generation used pure Python with some external packages such as numpy, py_midi, pretty_midi, tensorflow, sklearn, pandas, and scipy.

### How to Access the Game
The game is playable here: https://mikedoucettejr.github.io/Singable/

### Problems Encountered
We took a lot of risks in developing our project, especially with the back end. We used a github project called Lyrics-Conditioned Neural Melody Generation (https://github.com/yy1lab/Lyrics-Conditioned-Neural-Melody-Generation) that we discovered through a Piazza post by Dr. Bishop. After some work getting the project to run on our local machines, we decided to use it to create the music that plays along with our lyrics. The project needed to be updated to run on Python 3 from Python 2.7. It took some time to identify this problem and find a solution. 

The original plan was to set up a web server with a single endpoint. This endpoint would take an HTTP request with a given lyric, and return an audio file generated specifically for that lyric. We set this API up using Flask and integrated it with the python code provided by the github project we used. All of this worked when hosting the server locally, but many problems arose when migrating this to AWS. We tried to self-host this server using a plain EC2 instance and couldn't get it to run. We then moved to the AWS hosting service Elastic Beanstalk. We then learned that the machine learning algorithm used to generate the audio file upon each HTTP request required too much memory and storage for free AWS services, so we transitioned to Heroku. The Heroku hosting service also didn't work, so we found a server on AWS that cost more than $1/hour in order to run this backend code. Because this wasn't a feasible solution, we manually generated the audio files and stored them on Github. This isn't a longterm solution if we were to reach stretch goals such as automatically generating lyrics, but this a complicated problem in and of itself. 

A more general problem encountered was reconciling our normal group workflow with the global pandemic. We weren't able to help each other solve problems the same way as before, so we were much closer to our MVP than we were to achieving our stretch goals.  While this was frustrating and certainly slowed us down, we met over Zoom as much as possible and kept each other updated on our independent progress.

### Future Work
Given that this project only reached the basics of our MVP, there is plenty of room for future work.  The UI could definitely use playful animations and additional features.  Ideally, a full version of the game would have a feature that allow users to enter their own lyrics and create their own songs to express their creativity. 

Automatically generating lyrics or crowdsourcing lyrics would be a great way to expand this game. Additionally, manual generation of audio files without a web server isn't ideal and a better compromise for future development would be to store generated lyrics and their associated audio files in a database and access this database rather than regenerate audio files for each lyric everytime the game is played.
