import lyric_midi

audio_array = lyric_midi.lyric_to_wav('yellow floors on the east side of here')
print(audio_array)

print(lyric_midi.get_syl_lyric_list('yellow floors on the east side of here'))