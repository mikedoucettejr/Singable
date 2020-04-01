#### Code taken from https://github.com/yy1lab/Lyrics-Conditioned-Neural-Melody-Generation 

import numpy as np
import matplotlib.pyplot as plt #version 2.0.2
import tensorflow as tf #1.9
import lyric_midi_utils
from matplotlib.patches import Polygon
import os
from gensim.models import Word2Vec #Genism 3.6
from sklearn.neighbors import KernelDensity


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
def lyric_to_midi(lyrics):
    syll_model_path = 'assets/data/enc_models/syllEncoding_20190419.bin'
    word_model_path = 'assets/data/enc_models/wordLevelEncoder_20190419.bin'

    syl_lyr_list = []
    for word in lyrics.split(' '):
        try:
            syl_list =(syllable_dict[word])
        except KeyError:
            syl_list = ([word])
        for syl in syl_list:
            syl_lyr_list.append([syl, word])
    
    lyrics = syl_lyr_list

    syllModel = Word2Vec.load(syll_model_path)
    wordModel = Word2Vec.load(word_model_path)
    
    length_song = len(lyrics)
    cond = []

    for i in range(20):
        if i < length_song: # both
            syll2Vec = syllModel.wv[lyrics[i][0]]
            word2Vec = wordModel.wv[lyrics[i][1]]
            cond.append(np.concatenate((syll2Vec,word2Vec)))
        else: # just sylables
            cond.append(np.concatenate((syll2Vec,word2Vec)))

    flattened_cond = []
    for x in cond:
        for y in x:
            flattened_cond.append(y)

    model_path = 'assets/data/saved_gan_models/1August/epochs_models/model_epoch395'

    x_list = []
    y_list = []

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
        midi_pattern = lyric_midi_utils.create_midi_pattern_from_discretized_data(sample[0:length_song])
        destination = "test.mid"
        midi_pattern.write(destination)
    
    
    return destination
