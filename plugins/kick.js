export default async function (sock, m, from, args) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ للمجموعات فقط!" }, { quoted: m });

  const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                    m.message.extendedTextMessage?.contextInfo?.participant;

  if (!mentioned) return sock.sendMessage(from, { text: "⚠️ يرجى عمل منشن أو الرد على رسالة الشخص لطرده." }, { quoted: m });

  try {
    await sock.groupParticipantsUpdate(from, [mentioned], "remove");
    await sock.sendMessage(from, { text: `👋 تم طرد العضو بنجاح.` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر الطرد. تأكد أن البوت يمتلك رتبة مشرف (Admin)." }, { quoted: m });
  }
}
