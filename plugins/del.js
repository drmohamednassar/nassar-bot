export default async function (sock, m, from, args, config) {
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر يعمل داخل المجموعات فقط!" }, { quoted: m });
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

    // التحقق من أن البوت يمتلك رتبة مشرف (لحذف رسائل الآخرين)
    const botId = (sock.user?.id ? sock.user.id.split(":")[0] : sock.user?.jid?.split("@")[0]) + "@s.whatsapp.net";
    const isBotAdmin = groupAdmins.includes(botId);

    if (!isBotAdmin) {
      return sock.sendMessage(from, { 
        text: "⚠️ يجب رفع البوت مشرفاً (Admin) في المجموعة أولاً لحذف رسائل الأعضاء!" 
      }, { quoted: m });
    }

    const quoted = m.message?.extendedTextMessage?.contextInfo;
    if (!quoted || !quoted.stanzaId) {
      return sock.sendMessage(from, { text: "⚠️ قم بالرد على الرسالة المراد حذفها بهذا الأمر." }, { quoted: m });
    }

    const deleteKey = {
      remoteJid: from,
      fromMe: quoted.participant ? false : true,
      id: quoted.stanzaId,
      participant: quoted.participant
    };

    await sock.sendMessage(from, { delete: deleteKey });

  } catch (error) {
    console.error("Delete Command Error:", error);
    await sock.sendMessage(from, { text: "❌ تعذر حذف الرسالة. تأكد أن البوت يمتلك صلاحية مشرف في الجروب." }, { quoted: m });
  }
}
