# CosmoMusic
 
 最高クオリティのDiscord音楽Bot
 
 [Lavalink](https://github.com/lavalink-devs/lavalink) v4 と [Shoukaku](https://github.com/Deivu/Shoukaku) Clientを使用しています.

 Discordサーバーに[ここ](https://discord.com/api/oauth2/authorize?client_id=1132870841886060637&permissions=8&scope=bot%20applications.commands)でパブリックインスタンス（ただのBot）を招待できます。ただし、私のPCで実行されているためアップタイムは極めて悪いです。
 
# 🖥️ デバイスにインストール

 この[リポジトリ](https://github.com/Fyphen1223/CosmoMusic)をどうにかしてクローンしてください。例えば、以下のように: 
 
 ```bash
 git clone https://github.com/Fyphen1223/CosmoMusic.git 
 ```

 クローンが終われば、CosmoMusicフォルダにcdしてください。その後、次のコマンドでパッケージをインストールします:
 
 ```bash
 npm i 
 ```
 次に、config.jsonを作る必要があります。これはこのBotの重要なコアコンフィグになります。
 [./config.json.example](../config.json.example)で実例を確認してください. 

 [ここ](https://genius.com/developers)でGenius Lyrics APIのAPIキーを入手できます。 

 ここまでできれば、基本的にBotを使用する準備は終わりです。

 しかし、Botを使用する前に、Discordにスラッシュコマンドを登録する必要があります。

 以下のコマンドを実行して、Discordにスラッシュコマンドを登録します。
 ```
 node slash.js
 ```

 それが終われば、”CosmoMusic”フォルダ内で以下のコマンドを実行してください。
 
 ```
 node index.js
 ```

また、あなたはLavalinkサーバーも起動する必要があります（もしくはパブリックサーバーを使うか）。

 Lavalinkサーバーを起動する場合、以下を実行してください:

 ```
 cd Lavalink
 ```

 そして

 ```
 java -jar Lavalink.jar
 ```

 コンソールに"Lavalink is ready to accept connection"と表示されたら、あなたのBotはおそらく自動的に接続するでしょう。これで準備は終了です。

 あなたのBotとの交流を楽しんで。
 
# 🧰 機能
 
 -✅YouTube, SoundCloud, Spotify, YouTube Music, Deezer, Apple Musicなどから音楽を再生
 
 -✅キューシステム
 
 -✅シーク機能
 
 -✅24時間再生
 
 -✅貸検索機能
 
 -🔴SSL付きのダッシュボード (開発中)
 
 -🔴フィルター (開発中)

# ToDo
 
 -Spotify APIを使用した音楽レコメンド機能

# 内部アーキテクチャ
 新規のキューシステムを採用しています。

## キューシステムの構造
 
 JSONをキューとして使用しています。 [../utils/utils.js](../utils/utils.js)で宣言されています。

# Benchmark
 
 1つのサーバーでフィルターを使用せずプレイ中:
  
  RAM:
  
   Node.js Runtime (v20.0.1): 40MB
   
   JDK (Java 17 LTS): 300MB
   
   CPU: 6%~15% with Core i7-7500U

   55個の楽曲をキューに追加時
