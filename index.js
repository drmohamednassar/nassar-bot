import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import http from "http";
import config from "./config.js";

// ==========================================
// 🌐 خادم ويب مصغر لإبقاء Replit نشطاً
// ==========================================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.write("البوت يعمل 24/7 بنجاح!");
  res.end();
}).listen(PORT, () => {
  console.log(`🌐 خادم الويب يعمل الآن على المنفذ ${PORT}`);
});

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
    printQRInTerminal: true,
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "open") {
      console.log(`\n🚀 تم تشغيل [ ${config.botName} ] بنجاح وهو الآن متصل!\n`);
    } else if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
  });

  // ==========================================
  // 🌟 ميزة الترحيب بالأعضاء وتوديع المغادرين
  // ==========================================
  sock.ev.on("group-participants.update", async (anu) => {
    try {
      const { id, participants, action } = anu;
      const metadata = await sock.groupMetadata(id);

      for (const num of participants) {
        let ppUrl = null;
        try {
          ppUrl = await sock.profilePictureUrl(num, "image");
        } catch {
          ppUrl = "https://images.wallpapersden.com/image/download/kurumi-tokisaki-date-a-live-anime-girl_bW1sZ2aUmZqaraWkpJRmZ21lrWxnZQ.jpg";
        }

        const userTag = `@${num.split("@")[0]}`;

        if (action === "add") {
          const welcomeText = `
╭━━━〔 🌟 *مرحباً بك في المجموعة* 〕━━━╮
┃ 👤 *العضو الجديد:* ${userTag}
┃ 🏷️ *الجروب:* ${metadata.subject}
┃ 👥 *إجمالي الأعضاء:* ${metadata.participants.length}
╰━━━━━━━━━━━━━━━━━━━━━━╯

📖 *وصف وقوانين الجروب:*
${metadata.desc || "لا يوجد وصف محدد حالياً."}

🌹 *نورت الجروب! نتمنى لك قضاء وقت ممتع ومفيد.*
`.trim();

          await sock.sendMessage(id, {
            image: { url: ppUrl },
            caption: welcomeText,
            mentions: [num]
          });
        } else if (action === "remove") {
          const goodbyeText = `
╭━━━〔 👋 *توديع عضو* 〕━━━╮
┃ 👤 *العضو:* ${userTag}
┃ 🏷️ *غادر مجموعة:* ${metadata.subject}
┃ 👥 *الأعضاء المتبقين:* ${metadata.participants.length}
╰━━━━━━━━━━━━━━━━━━━━╯

🕊️ *نتمنى لك التوفيق، مع السلامة!*
`.trim();

          await sock.sendMessage(id, {
            image: { url: ppUrl },
            caption: goodbyeText,
            mentions: [num]
          });
        }
      }
    } catch (err) {
      console.error("خطأ في معالجة حدث الترحيب/المغادرة:", err);
    }
  });

  // ==========================================
  // ⚡ معالجة الأوامر والرسائل
  // ==========================================
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
