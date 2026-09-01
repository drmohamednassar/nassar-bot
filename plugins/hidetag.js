export default async function (sock, m, from, args) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ هذا الأمر للمجموعات فقط!" }, { quoted: m });

  const customMessage = args.join(" ");
  if (!customMessage) return sock.sendMessage(from, { text: "⚠️ اكتب الرسالة التي تريد إرسالها للجميع." }, { quoted: m });

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    await sock.sendMessage(from, { 
      text: customMessage, 
      mentions: participants.map(a => a.id) 
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل تنفيذ الأمر." }, { quoted: m });
  }
}
