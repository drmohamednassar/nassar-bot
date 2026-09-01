export default async function (sock, m, from) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ للمجموعات فقط!" }, { quoted: m });

  try {
    const code = await sock.groupInviteCode(from);
    await sock.sendMessage(from, { text: `🔗 رابط دعوة الجروب:\nhttps://chat.whatsapp.com/${code}` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر جلب الرابط. تأكد أن البوت مشرف في المجموعة." }, { quoted: m });
  }
}
