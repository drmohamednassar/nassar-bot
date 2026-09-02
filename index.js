import makeWASocket, { 
  DisconnectReason, 
  initAuthCreds, 
  BufferJSON, 
  proto 
} from "@whiskeysockets/baileys";
import { MongoClient } from "mongodb";
import pino from "pino";
import fs from "fs";
import path from "path";
import config from "./config.js";

// رابط قاعدة بيانات MongoDB الخاص بك
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://drmohamednassarpt_db_user:5sH3WBpVNpva3SXj@cluster0.dpvxscb.mongodb.net/?appName=Cluster0";

// دالة تخزين واسترجاع الجلسة من MongoDB تلقائياً
async function useMongoDBAuthState(collection) {
  const writeData = (data, id) => {
    return collection.replaceOne(
      { _id: id },
      { _id: id, value: JSON.stringify(data, BufferJSON.replacer) },
      { upsert: true }
    );
  };

  const readData = async (id) => {
    try {
      const data = await collection.findOne({ _id: id });
      if (!data || !data.value) return null;
      return JSON.parse(data.value, BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (id) => {
    try {
      await collection.deleteOne({ _id: id });
    } catch {}
  };

  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const name = `${category}-${id}`;
              tasks.push(value ? writeData(value, name) : removeData(name));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, "creds")
  };
}

async function startBot() {
  // الاتصال بقاعدة البيانات
  console.log("⏳ جارٍ الاتصال بقاعدة بيانات MongoDB...");
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("whatsapp_bot");
  const sessionCollection = db.collection("auth_session");
  console.log("✅ تم الاتصال بقاعدة البيانات بنجاح!");

  // جلب بيانات الجلسة من السحابة
  const { state, saveCreds } = await useMongoDBAuthState(sessionCollection);

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
      console.log(`\n🚀 تم تشغيل [ ${config.botName} ] بنجاح والجلسة محفوظة سحابياً 24/7!\n`);
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
