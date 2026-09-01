export default async function (sock, m, from) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ للمجموعات فقط!" }, { quoted: m });

  const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                    m.message.extendedTextMessage?.contextInfo?.participant;

  if (!mentioned) return sock.sendMessage(from, { text: "⚠️ قم بعمل منشن أو الرد على رسالة العضو لترقيته مشرفاً." }, { quoted: m });

  try {
    await sock.groupParticipantsUpdate(from, [mentioned], "promote");
    await sock.sendMessage(from, { text: `🎖️ تمت ترقية العضو إلى مشرف بنجاح!` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل رفع العضو. تأكد من صلاحيات البوت." }, { quoted: m });
  }
}
