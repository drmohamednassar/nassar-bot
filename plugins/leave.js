export default async function (sock, m, from, args, config) {
  const senderNumber = (m.key.participant || m.key.remoteJid).split("@")[0];

  if (!config.sudo.includes(senderNumber)) {
    return sock.sendMessage(from, { text: "⛔ هذا الأمر مخصص للمطور فقط!" }, { quoted: m });
  }

  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل داخل المجموعات فقط." }, { quoted: m });
  }

  await sock.sendMessage(from, { text: "👋 مع السلامة! تم استدعاء المغادرة من المطور." }, { quoted: m });
  await sock.groupLeave(from);
}
