export default async function (sock, m, from, args, config) {
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل داخل المجموعات فقط!" }, { quoted: m });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    // تحديد هوية المرسل
    const sender = m.sender || m.key.participant || from;

    // استخراج قائمة المشرفين
    const groupAdmins = participants
      .filter(p => p.admin === "admin" || p.admin === "superadmin")
      .map(p => p.id);

    // التحقق من صلاحية المشرف أو مطور البوت
    const isAdmin = groupAdmins.includes(sender);
    const isOwner = m.key.fromMe || (config?.owner && config.owner.some(o => sender.includes(o.replace(/[^0-9]/g, ""))));

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(from, { 
        text: "⛔ *عذراً! هذا الأمر مخصص فقط لمشرفي المجموعة ومطور البوت.*" 
      }, { quoted: m });
    }

    const adminsCount = groupAdmins.length;
    const info = `
📋 *معلومات المجموعة:*

🏷️ *الاسم:* ${groupMetadata.subject}
👥 *الأعضاء:* ${participants.length}
👮‍♂️ *المشرفين:* ${adminsCount}
🆔 *المعرف:* ${groupMetadata.id}
📝 *الوصف:*
${groupMetadata.desc || "لا يوجد وصف"}
`;

    await sock.sendMessage(from, { text: info.trim() }, { quoted: m });

  } catch (error) {
    console.error("GroupInfo Error:", error);
    await sock.sendMessage(from, { text: "❌ تعذر جلب معلومات المجموعة." }, { quoted: m });
  }
}
