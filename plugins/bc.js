export default async function (sock, m, from, args, config) {
  const senderNumber = (m.key.participant || m.key.remoteJid).split("@")[0];

  if (!config.sudo.includes(senderNumber)) {
    return sock.sendMessage(from, { text: "⛔ هذا الأمر مخصص للمطور فقط!" }, { quoted: m });
  }

  const broadcastMsg = args.join(" ");
  if (!broadcastMsg) {
    return sock.sendMessage(from, { text: "⚠️ اكتب الرسالة المراد إذاعتها بعد الأمر.\nمثال: .bc السلام عليكم جميعاً" }, { quoted: m });
  }

  try {
    const chats = await sock.groupFetchAllParticipating();
    const groups = Object.values(chats);

    await sock.sendMessage(from, { text: `⏳ جاري الإذاعة إلى *${groups.length}* مجموعة...` }, { quoted: m });

    for (let group of groups) {
      await sock.sendMessage(group.id, { 
        text: `📢 *إذاعة رسمية من المطور:*\n\n${broadcastMsg}\n\n🤖 *${config.botName}*` 
      });
    }

    await sock.sendMessage(from, { text: "✅ تمت الإذاعة لجميع المجموعات بنجاح!" }, { quoted: m });
  } catch (err) {
    await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء محاولة الإذاعة." }, { quoted: m });
  }
}
