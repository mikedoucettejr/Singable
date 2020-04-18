#### Code taken from https://github.com/yy1lab/Lyrics-Conditioned-Neural-Melody-Generation 

import numpy as np
import matplotlib.pyplot as plt #version 2.0.2
import tensorflow as tf #1.9
import lyric_midi_utils
from matplotlib.patches import Polygon
import os
from gensim.models import Word2Vec #Genism 3.6
from sklearn.neighbors import KernelDensity
import scipy.io.wavfile as wavf
import pretty_midi


#Create dictionary
#https://www.gutenberg.org/ebooks/3204
syl_str_dict = open("assets/data/mhyph.txt", "r").read()
syl_list_dict = []
word_list_dict = []
for word in syl_str_dict.split('\n'):
    word_syl_list = []
    word_concat = ''
    for syl in word.split('\xa5'):
        word_syl_list.append(syl.strip('\r').lower())
        word_concat = word_concat + str(syl.strip('\r').lower())
    syl_list_dict.append(word_syl_list)
    word_list_dict.append(word_concat)
syllable_dict = dict(zip(word_list_dict, syl_list_dict))

# takes LYRIC as STR (no punctuation)
# outputs MIDI file
def get_syl_lyric_list(lyrics):
    syl_lyr_list = []
    for word in lyrics.split(' '):
        try:
            syl_list =(syllable_dict[word])
        except KeyError:
            syl_list = ([word])
        for syl in syl_list:
            syl_lyr_list.append([syl, word])
    
    return syl_lyr_list
    
def create_midi_pattern_w_sample (discretized_sample, syl_list):
    new_midi = pretty_midi.PrettyMIDI()
    voice = pretty_midi.Instrument(1)  # It's here to change the used instruments !
    tempo = 120
    ActualTime = 0  # Time since the beginning of the song, in seconds
    for i in range(0,len(discretized_sample)):
        length = discretized_sample[i][1] * 60 / tempo  # Conversion Duration to Time
        if i < len(discretized_sample) - 1:
            gap = discretized_sample[i + 1][2] * 60 / tempo
        else:
            gap = 0  # The Last element doesn't have a gap
        note = pretty_midi.Note(velocity=100, pitch=int(discretized_sample[i][0]), start=ActualTime,
                                end=ActualTime + length)
        voice.notes.append(note)
        ActualTime += length + gap  # Update of the time

    new_midi.instruments.append(voice)

    return new_midi

def lyric_to_wav(lyrics):
    syll_model_path = 'assets/data/enc_models/syllEncoding_20190419.bin'
    word_model_path = 'assets/data/enc_models/wordLevelEncoder_20190419.bin'
    
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
            syll2Vec = syllModel.wv[lyrics[i][0]]
            word2Vec = wordModel.wv[lyrics[i][1]]
            cond.append(np.concatenate((syll2Vec,word2Vec)))
            #print(lyrics[i][1])
        else: # just sylables
            cond.append(np.concatenate((syll2Vec,word2Vec)))

    flattened_cond = []
    for x in cond:
        for y in x:
            flattened_cond.append(y)

    model_path = 'assets/data/saved_gan_models/1August/epochs_models/model_epoch395'

    lyric_len = len(lyrics)

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
        midi_pattern = create_midi_pattern_w_sample(sample[0:length_song], syl_list)
        #destination = "test.mid"
        #midi_pattern.write(destination)

        audio_data = midi_pattern.synthesize() # synthesizes into numpy array (with wav encoding)
        fs = 44100
        out_f = 'out.wav'

        wavf.write(out_f, fs, audio_data) # writes audio data to above location with numpy array & sample rate
        print('wav written to "out.wav" & audio numpy returned')
    
    return audio_data # returning numpy array of audio data (wav is written to 'out.wav')