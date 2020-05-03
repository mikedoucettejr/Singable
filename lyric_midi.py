#### Code taken from https://github.com/yy1lab/Lyrics-Conditioned-Neural-Melody-Generation 

import numpy as np
import tensorflow as tf #1.9
import tensorflow.compat.v1 as tf
tf.disable_v2_behavior()
import lyric_midi_utils
import os
from gensim.models import Word2Vec #Genism 3.6
from sklearn.neighbors import KernelDensity
import soundfile as sf
import pretty_midi
from gtts import gTTS
from pydub import AudioSegment

#Create dictionary
#https://www.gutenberg.org/ebooks/3204
syl_str_dict = open("assets/data/mhyph.txt", "rb").read().decode(errors='backslashreplace')
syl_list_dict = []
word_list_dict = []
for word in syl_str_dict.split('\n'):
    word_syl_list = []
    word_concat = ''
    for syl in word.split('\\xa5'):
        word_syl_list.append(syl.strip('\r').lower())
        word_concat = word_concat + str(syl.strip('\r').lower())
    syl_list_dict.append(word_syl_list)
    word_list_dict.append(word_concat)
syllable_dict = dict(zip(word_list_dict, syl_list_dict))
print('syllable_dict created')

# takes LYRIC as STR (no punctuation)
# outputs MIDI file
def get_syl_lyric_list(lyrics):
    syl_lyr_list = []
    for word in lyrics.split(' '):
        word = word.lower()
        try:
            syl_list =(syllable_dict[word])
        except KeyError:
            syl_list = ([word])
        for syl in syl_list:
            syl_lyr_list.append([syl, word])
    
    return syl_lyr_list
    
def create_midi_pattern_w_sample (discretized_sample, lyrics):
    new_midi = pretty_midi.PrettyMIDI()
    bass = pretty_midi.Instrument(33)  # It's here to change the used instruments !
    treble = pretty_midi.Instrument(21)  # It's here to change the used instruments !    
    tempo = 182
    ActualTime = 0  # Time since the beginning of the song, in seconds
    for i in range(0,len(discretized_sample)):
        length = discretized_sample[i][1] * 60 / tempo  # Conversion Duration to Time
        if i < len(discretized_sample) - 1:
            gap = discretized_sample[i + 1][2] * 60 / tempo
        else:
            gap = 0  # The Last element doesn't have a gap
        bass_note = pretty_midi.Note(velocity=100, pitch=int(discretized_sample[i][0]-3), start=ActualTime,
                                end=ActualTime + length)
        bass.notes.append(bass_note)
        #treble_note = pretty_midi.Note(velocity=100, pitch=int(discretized_sample[i][0]+12), start=ActualTime,
        #                        end=ActualTime + length)
        #treble.notes.append(treble_note)

        if i < len(lyrics): 
            lyric_obj = pretty_midi.Lyric(lyrics[i], ActualTime)
            new_midi.lyrics.append(lyric_obj)
            #print(lyric_obj)

        ActualTime += length + gap  # Update of the time

    new_midi.instruments.append(bass)
    #new_midi.instruments.append(treble)

    return new_midi

def lyric_to_wav(lyrics):
    syll_model_path = 'assets/data/enc_models/syllEncoding_20190419.bin'
    word_model_path = 'assets/data/enc_models/wordLevelEncoder_20190419.bin'
    
    orig_lyric = lyrics
    lyric_str = lyrics.split(' ')
    lyrics = get_syl_lyric_list(lyrics)
    syl_list = []
    for s_list in lyrics:
        syl_list.append(s_list[0])

    syllModel = Word2Vec.load(syll_model_path)
    wordModel = Word2Vec.load(word_model_path)
    
    length_song = len(lyrics)
    cond = []

    for i in range(20):
        if i < length_song: # both
            try:
                syll2Vec = syllModel.wv[lyrics[i][0]]
                word2Vec = wordModel.wv[lyrics[i][1]]
            except KeyError:
                syll2Vec = syllModel.wv[lyrics[i-1][0]] #Potential index error
                word2Vec = wordModel.wv[lyrics[i-1][0]]
            cond.append(np.concatenate((syll2Vec,word2Vec)))
        else: # just sylables
            cond.append(np.concatenate((syll2Vec,word2Vec)))

    flattened_cond = []
    for x in cond:
        for y in x:
            flattened_cond.append(y)

    model_path = 'assets/data/saved_gan_models/1August/epochs_models/model_epoch395'

    lyric_len = len(lyrics)
    print(lyric_str)

    with tf.Session(graph=tf.Graph()) as sess:
        tf.saved_model.loader.load(sess, [], model_path)
        graph = tf.get_default_graph()
        keep_prob = graph.get_tensor_by_name("model/keep_prob:0")
        input_metadata = graph.get_tensor_by_name("model/input_metadata:0")
        input_songdata = graph.get_tensor_by_name("model/input_data:0")
        output_midi = graph.get_tensor_by_name("output_midi:0")
        feed_dict = {}
        feed_dict[keep_prob.name] = 1.0
        condition = []
        feed_dict[input_metadata.name] = condition
        feed_dict[input_songdata.name] = np.random.uniform(size=(1, 20, 3))
        condition.append(np.split(np.asarray(flattened_cond), 20))
        feed_dict[input_metadata.name] = condition
        generated_features = sess.run(output_midi, feed_dict)
        sample = [x[0, :] for x in generated_features]
        sample = lyric_midi_utils.tune_song(lyric_midi_utils.discretize(sample))
        midi_pattern = create_midi_pattern_w_sample(sample[0:length_song], lyric_str)

        lyric_midi_utils.create_midi_pattern_from_discretized_data
        #destination = "test.mid"
        #midi_pattern.write(destination)

        audio_data = wav_from_midi(midi_pattern)
    
    overlay_song_from_lyric(orig_lyric)
    return 'overlayed.wav' # returning numpy array of audio data (wav is written to 'out.wav')


def wav_from_midi(midi):
    audio_data = midi.synthesize() # synthesizes into numpy array (with wav encoding)
    sf.write('backing.wav', audio_data, 44100)
    print('wav written to "backing.wav" & audio numpy returned')

    return audio_data

def overlay_song_from_lyric(lyric):
    
    tts = gTTS(lyric, slow=True)
    tts.save('text.mp3')
    
    backing = AudioSegment.from_file("backing.wav")
    text = AudioSegment.from_file("text.mp3")

    quieter_backing = backing.apply_gain(-1.5)
    quieter_text = text.apply_gain(-3.0)

    played_togther = quieter_backing.overlay(quieter_text)
    
    played_togther.export('overlayed.wav')
    print("final wav file printed to 'overlayed.wav'")