const fs = require("fs");
const https = require("https");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");
const helmet = require("helmet");
const config = require("./config.json");
const util = require("./utils/utils.js");
const RateLimit = require("express-rate-limit");
const log = new util.logger();
const apiClients = require("./utils/api-client.js");
const discordUserClient = new apiClients.discordUserInfoClient({
    clientId: config.bot.applicationId,
    clientSecret: config.bot.clientSecret,
    url: config.config.dashboard.url,
});

function startServer(boot) {
    if (boot) {
        const app = express();
        const sessions = session({
            secret: config.config.dashboard.cookieSecret,
            resave: true,
            saveUninitialized: true,
            name: "session",
            cookie: {
                httpOnly: true,
                secure: true,
                maxAge: 60000,
            },
        });
        app.use(sessions);
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser());
        const limiter = RateLimit({
            windowMs: 1 * 60 * 1000,
            max: 100,
        });
        app.use(limiter);
        app.use(helmet());
        app.use(express.json());
        const server = https.createServer(
            {
                key: fs.readFileSync("./ssl/privatekey.pem"),
                cert: fs.readFileSync("./ssl/cert.pem"),
                ca: fs.readFileSync("./ssl/chain.pem"),
            },
            app
        );
        const io = new socketio.Server(server);
        io.engine.use(sessions);
        server.listen(config.config.adminPort, () => {
            log.ready(`Server started on ${config.config.adminPort}`);
            log.info("If you want to change port number, please edit config.json");
            return;
        });
        function addServer() {
            app.get("/login", async (req, res) => {
                res.set("Content-Type", "text/html");
                res.send(fs.readFileSync("./web/login.html"));
            });
            app.post("/login", (req, res) => { });
            app.get("/logout", (req, res) => {
                req.session.destroy((err) => {
                    res.redirect("/");
                });
            });
            app.get("/icon", (req, res) => {
                res.set("Content-Type", "image/png");
                res.send(fs.readFileSync("./web/icon.png"));
            });
            app.get("/index.js", (req, res) => {
                res.set("Content-Type", "text/javascript");
                res.send(fs.readFileSync("./web/index.js"));
                return;
            });
            app.get("/services", (req, res) => {
                res.set("Content-Type", "text/html");
                res.send(fs.readFileSync("./web/services.html"));
            });
            app.get("/", async (req, res) => {
                const params = req.query;
                const code = params.code;
                if (req.session.username) {
                    res.set("Content-Type", "text/html");
                    await res.send(fs.readFileSync("./web/user.html"));
                    return;
                }
                try {
                    const oauthData = await discordUserClient.getAccessToken(code);
                    req.session.regenerate(async (err) => {
                        req.session.accessToken = oauthData.access_token;
                        req.session.refreshToken = oauthData.refresh_token;
                        const userInfo = await discordUserClient.getUserInfo(oauthData);
                        req.session.username = userInfo.username;
                        req.session.id = userInfo.id;
                        req.session.avatar = userInfo.avatar;
                        req.session.discriminator = userInfo.discriminator;
                        req.session.email = userInfo.email;
                        req.session.verified = userInfo.verified;
                        res.redirect("/");
                    });
                } catch (error) {
                    console.log(error.stack);
                    res.redirect("/login");
                    return;
                }
            });
        }
        addServer();
        io.on("connection", (socket) => {
            const session = socket.request.session;
            socket.emit("info", {
                username: session.username,
                email: session.email,
            });
        });
    }
}
module.exports = { startServer };
