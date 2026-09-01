export default async function (sock, m, from) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل داخل المجموعات فقط!" }, { quoted: m });

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const admins = groupMetadata.participants.filter(p => p.admin).length;

    const info = `
📋 *معلومات المجموعة:*

🏷️ *الاسم:* ${groupMetadata.subject}
👥 *الأعضاء:* ${groupMetadata.participants.length}
👮‍♂️ *المشرفين:* ${admins}
🆔 *المعرف:* ${groupMetadata.id}
📝 *الوصف:*
${groupMetadata.desc || "لا يوجد وصف"}
`;
    await sock.sendMessage(from, { text: info.trim() }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر جلب معلومات المجموعة." }, { quoted: m });
  }
}
