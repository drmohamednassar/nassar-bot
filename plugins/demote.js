export default async function (sock, m, from, args, config) {
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر مخصص للمجموعات فقط!" }, { quoted: m });
  }

  try {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;

    // تحديد هوية المنفذ
    const sender = m.sender || m.key.participant || from;

    // استخراج قائمة المشرفين
    const groupAdmins = participants
      .filter(p => p.admin === "admin" || p.admin === "superadmin")
      .map(p => p.id);

    // التحقق من صلاحية المنفذ (مشرف أو مطور)
    const isAdmin = groupAdmins.includes(sender);
    const isOwner = m.key.fromMe || (config?.owner && config.owner.some(o => sender.includes(o.replace(/[^0-9]/g, ""))));

    if (!isAdmin && !isOwner) {
      return sock.sendMessage(from, { 
        text: "⛔ *عذراً! هذا الأمر مخصص فقط لمشرفي المجموعة ومطور البوت.*" 
      }, { quoted: m });
    }

    // التحقق من أن البوت يمتلك رتبة مشرف
    const botId = (sock.user?.id ? sock.user.id.split(":")[0] : sock.user?.jid?.split("@")[0]) + "@s.whatsapp.net";
    const isBotAdmin = groupAdmins.includes(botId);

    if (!isBotAdmin) {
      return sock.sendMessage(from, { 
        text: "⚠️ يجب رفع البوت مشرفاً (Admin) في المجموعة أولاً لتنزيل المشرفين!" 
      }, { quoted: m });
    }

    // استخراج العضو المستهدف (سواء بالمنشن أو الرد)
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                      m.message?.extendedTextMessage?.contextInfo?.participant ||
                      m.quoted?.sender;

    if (!mentioned) {
      return sock.sendMessage(from, { 
        text: "⚠️ قم بعمل منشن أو الرد على رسالة المشرف لسحب الرتبة.\nمثال: *.demote @المشرف*" 
      }, { quoted: m });
    }

    // حماية البوت من سحب الرتبة من نفسه
    if (mentioned === botId) {
      return sock.sendMessage(from, { text: "⚠️ لا يمكن للبوت سحب رتبة الإشراف من نفسه!" }, { quoted: m });
    }

    // التأكد من أن الشخص يحمل رتبة مشرف بالفعل
    if (!groupAdmins.includes(mentioned)) {
      return sock.sendMessage(from, { 
        text: "⚠️ هذا العضو ليس مشرفاً بالفعل في المجموعة!" 
      }, { quoted: m });
    }

    // حماية المطور من سحب الإشراف إذا كان المنفذ مشرفاً عادياً
    const isTargetOwner = config?.owner && config.owner.some(o => mentioned.includes(o.replace(/[^0-9]/g, "")));
    if (isTargetOwner && !isOwner) {
      return sock.sendMessage(from, { text: "⚠️ لا يمكن سحب رتبة الإشراف من مطور البوت!" }, { quoted: m });
    }

    // تنزيل رتبة المشرف
    await sock.groupParticipantsUpdate(from, [mentioned], "demote");
    await sock.sendMessage(from, { 
      text: `🔻 تم تنزيل رتبة المشرف إلى عضو عادي بنجاح: @${mentioned.split("@")[0]}`,
      mentions: [mentioned]
    }, { quoted: m });

  } catch (error) {
    console.error("Demote Command Error:", error);
    await sock.sendMessage(from, { 
      text: "❌ فشل سحب الرتبة. تأكد من صلاحيات البوت وصحة المعرف." 
    }, { quoted: m });
  }
}
