# CosmoMusic
 
 The greatest discord music bot which provides superior music experience.
 
 Using [Lavalink](https://github.com/lavalink-devs/lavalink) v4 and [Shoukaku](https://github.com/Deivu/Shoukaku) Client.

 You can invite the public instance (a.k.a the bot which is running in my PC) [here](https://discord.com/api/oauth2/authorize?client_id=1132870841886060637&permissions=8&scope=bot%20applications.commands) , but the bot's uptime is terribly bad.

 For license, see [./LICENSE](./LICENSE)

 For security policy, see [./SECURITY.md](./SECURITY.md)

 For code of conduct, see [./CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

 If you want to contribute, see [./CONTRIBUTING.md](./CONTRIBUTING.md)

 ## Star, Fork History and People
 
 <a href="https://star-history.com/#Fyphen1223/CosmoMusic&Date">
   <picture>
     <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Fyphen1223/CosmoMusic&type=Date&theme=dark" />
     <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Fyphen1223/CosmoMusic&type=Date" />
     <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Fyphen1223/CosmoMusic&type=Date" />
   </picture> 
 </a>

 [![Stargazers repo roster for @Fyphen1223/CosmoMusic](https://reporoster.com/stars/dark/Fyphen1223/CosmoMusic)](https://github.com/Fyphen1223/CosmoMusic/stargazers)

 [![Forkers repo roster for @Fyphen1223/CosmoMusic](https://reporoster.com/forks/dark/Fyphen1223/CosmoMusic)](https://github.com/Fyphen1223/CosmoMusic/network/members)


# 🖥️ Install on your device

 Be aware that this bot might not be suitable for personal uses because it requires SSL certificate or domain or something like that. If you do not want to do such tedious things, you should remove some lines from this repo such as the code that establishes server, or palm AI chat.

 This [repository](https://github.com/Fyphen-Devs/CosmoMusic-Private) is a fork for personal use.
 
 Clone this [repository](https://github.com/Fyphen1223/CosmoMusic) somehow. For example, you can simply do this command: 
 
 ```bash
 git clone https://github.com/Fyphen1223/CosmoMusic.git 
 ```

 Then just change directory in the "CosmoMusic" folder, and install packages with the below command:
 
 ```bash
 pnpm i 
 ```

 <details><summary>When error</summary><div>
  
 You have not installed pnpm yet. Please install pnpm using below command:

 ```
 npm install -g pnpm
 ```

 </div></details>
 
 Then you have to create config.json, which will be a core config of the bot.
 See [./config.json.example](./config.json.example) to get some instance. 

 You can get genius lyric api's api key with [here](https://genius.com/developers) 

 When finished editing config, you will basically be ready to boot up your bot.

 However, before that, you have to register slash commands.

 Please type 
 ```
 node slash.js
 ```

 to register this bot's slash commands to the Discord server.

 If that's done, then simply type
 
 ```
 node index.js
 ```

 in "CosmoMusic" folder, and you also have to start Lavalink server as well (or just use public server).

 To start the server, you have to do these:

 ```
 cd Lavalink
 ```

 and 

 ```
 java -jar Lavalink.jar
 ```

 When the console shows "Lavalink is ready to accept connection", your bot will connect to the Lavalink server, and that's done!

 Enjoy the highquality music bot!
 
# 🧰 Feature
 
 -✅Play music from YouTube, SoundCloud, Spotify, YouTube Music, Deezer, Apple Music, and etc...
 
 -✅Queue system
 
 -✅Seek function
 
 -✅24/7 playing
 
 -✅Lyric searching
 
 -🔴Dashboard with SSL (still in development)
 
 -🔴Filter (still in development)

# ToDo
 
 []Music recommendations with Spotify API
 [x]Music recommendations with YouTube music search

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
