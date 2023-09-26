# CosmoMusic
 
 The greatest discord music bot which provides superior music experience.
 
 Using [Lavalink](https://github.com/lavalink-devs/lavalink) v4 and [Shoukaku](https://github.com/Deivu/Shoukaku) Client.

# 🖥️ Install on your device 

 Clone this [repository](https://github.com/Fyphen1223/CosmoMusic) somehow. For example, you can simply do this command: 
 
 ```bash
 git clone https://github.com/Fyphen1223/CosmoMusic.git 
 ```

 Then just change directory in the "CosmoMusic" folder, and install packages with the below command:
 
 ```bash
 npm i 
 ```
 
 Then you have to create config.json, which will be a core config of the bot.
 See [./config.json.example](./config.json.example) to get some instance. 

 You can get genius lyric api's api key with [here](https://genius.com/developers) 

# 🧰 Feature
 
 -✅Play music from YouTube, SoundCloud, Spotify, YouTube Music, Deezer, Apple Music, and etc...
 
 -✅Queue system
 
 -✅Seek function
 
 -✅24/7 playing
 
 -✅Lyric searching
 
 -🔴Dashboard with SSL (still in development)
 
 -🔴Filter (still in development)

# ToDo
 
 -Music recommendations with Spotify API

# Internal architecture
 
 Using new queue system on this bot.

## Queue System Architecture
 
 Using JSON as queue. Declared in [./utils/utils.js](./utils/utils.js)

# Benchmark
 
 Playing in 1 server without filter:
  
  RAM:
  
   Node.js Runtime (v20.0.1): 40MB
   
   JDK (Java 17 LTS): 300MB
   
   CPU: 6%~15% with Core i7-7500U

   55 Music in queue
