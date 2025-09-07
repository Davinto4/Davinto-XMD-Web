const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const { default: makeWASocket, useSingleFileAuthState } = require("@adiwajshing/baileys");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));
app.use(express.json());

// WhatsApp setup
const { state, saveState } = useSingleFileAuthState("./auth_info.json");
const sock = makeWASocket({ auth: state, printQRInTerminal: true });
sock.ev.on("creds.update", saveState);

// Database
const dbPath = "./database.json";
const loadDB = () => JSON.parse(fs.readFileSync(dbPath));
const saveDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Listen to messages from WhatsApp
sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    io.emit("newMessage", { from: msg.key.remoteJid, text });
});

// Socket.io for frontend
io.on("connection", (socket) => {
    console.log("👤 Web client connected");

    socket.on("sendMessage", async ({ to, message }) => {
        await sock.sendMessage(to, { text: message });
        socket.emit("messageSent", { to, message });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🌐 Web interface running on http://localhost:${PORT}`);
});
