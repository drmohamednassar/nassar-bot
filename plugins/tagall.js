export default async function (sock, m, from, args, config) {
  if (!from.endsWith("@g.us")) {
    return sock.sendMessage(from, { text: "⚠️ هذا الأمر مخصص للمجموعات فقط!" }, { quoted: m });
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

    const customMessage = args.join(" ") || "انتباه للجميع 📢";

    let tagText = `📢 *${customMessage}*\n👥 *العدد:* ${participants.length}\n\n`;
    for (let mem of participants) {
      tagText += `🔹 @${mem.id.split("@")[0]}\n`;
    }

    await sock.sendMessage(from, { 
      text: tagText.trim(), 
      mentions: participants.map(a => a.id) 
    }, { quoted: m });

  } catch (error) {
    console.error("Tagall Error:", error);
    await sock.sendMessage(from, { text: "❌ تعذر إرسال المنشن." }, { quoted: m });
  }
}
