import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import config from "./config.js";

async function startBot() {
  if (process.env.SESSION_ID && !fs.existsSync("./session/creds.json")) {
    if (!fs.existsSync("./session")) fs.mkdirSync("./session", { recursive: true });
    try {
      const credsData = Buffer.from(process.env.SESSION_ID, "base64").toString("utf-8");
      fs.writeFileSync("./session/creds.json", credsData);
    } catch (e) {
      console.error("خطأ في قراءة SESSION_ID:", e.message);
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = (makeWASocket.default || makeWASocket)({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log(`\n🚀 تم تشغيل [ ${config.botName} ] بنجاح وهو الآن متصل 24/7!\n`);
    } else if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const body = m.message.conversation || 
                 m.message.extendedTextMessage?.text || 
                 m.message.imageMessage?.caption || 
                 m.message.videoMessage?.caption || "";

    if (!body.startsWith(config.prefix)) return;

    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const pluginPath = path.resolve(`./plugins/${command}.js`);
    if (fs.existsSync(pluginPath)) {
      try {
        const plugin = await import(`file://${pluginPath}?update=${Date.now()}`);
        await plugin.default(sock, m, from, args, config);
      } catch (err) {
        console.error(`خطأ في تشغيل الأمر ${command}:`, err);
        await sock.sendMessage(from, { text: "⚠️ حدث خطأ أثناء معالجة الأمر." }, { quoted: m });
      }
    }
  });
}

startBot();
