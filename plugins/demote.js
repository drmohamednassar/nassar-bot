export default async function (sock, m, from) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ للمجموعات فقط!" }, { quoted: m });

  const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                    m.message.extendedTextMessage?.contextInfo?.participant;

  if (!mentioned) return sock.sendMessage(from, { text: "⚠️ قم بعمل منشن أو الرد على المشرف لسحب الرتبة." }, { quoted: m });

  try {
    await sock.groupParticipantsUpdate(from, [mentioned], "demote");
    await sock.sendMessage(from, { text: `🔻 تم تنزيل رتبة المشرف إلى عضو عادي.` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل تنزيل الرتبة. تأكد من صلاحيات البوت." }, { quoted: m });
  }
}
