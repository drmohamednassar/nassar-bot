export default async function (sock, m, from, args, config) {
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر للمجموعات فقط!" }, { quoted: m });
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

    // التحقق من صلاحية المرسل (مشرف أو مطور)
    const isAdmin = groupAdmins.includes(sender);
    const isOwner = m.key.fromMe || (config?.owner && config.owner.some(o => sender.includes(o.replace(/[^0-9]/g, ""))));

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(from, { 
        text: "⛔ *عذراً! هذا الأمر مخصص فقط لمشرفي المجموعة ومطور البوت.*" 
      }, { quoted: m });
    }

    // التحقق من أن البوت مشرف ليتمكن من تغيير إعدادات المجموعة
    const botId = (sock.user?.id ? sock.user.id.split(":")[0] : sock.user?.jid?.split("@")[0]) + "@s.whatsapp.net";
    const isBotAdmin = groupAdmins.includes(botId);

    if (!isBotAdmin) {
      return sock.sendMessage(from, { 
        text: "⚠️ يجب رفع البوت مشرفاً (Admin) في المجموعة أولاً لتنفيذ هذا الأمر!" 
      }, { quoted: m });
    }

    const action = args[0]?.toLowerCase();
    if (action === "close" || action === "قفل") {
      await sock.groupSettingUpdate(from, "announcement");
      await sock.sendMessage(from, { text: "🔒 تم قفل المجموعة (الإرسال متاح للمشرفين فقط)." }, { quoted: m });
    } else if (action === "open" || action === "فتح") {
      await sock.groupSettingUpdate(from, "not_announcement");
      await sock.sendMessage(from, { text: "🔓 تم فتح المجموعة لجميع الأعضاء." }, { quoted: m });
    } else {
      await sock.sendMessage(from, { 
        text: "⚠️ الاستخدام الصحيح:\n* .group open (لفتح الجروب)\n* .group close (لقفل الجروب)" 
      }, { quoted: m });
    }

  } catch (error) {
    console.error("Group Command Error:", error);
    await sock.sendMessage(from, { text: "❌ تعذر تعديل إعدادات المجموعة." }, { quoted: m });
  }
}
