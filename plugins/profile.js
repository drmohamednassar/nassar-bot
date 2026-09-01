export default async function (sock, m, from, args, config) {
  try {
    // تحديد الهدف: إما منشن، أو رد على رسالة، أو مرسل الرسالة نفسه
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    let target = m.key.participant || m.key.remoteJid;

    if (quoted?.mentionedJid?.[0]) {
      target = quoted.mentionedJid[0];
    } else if (quoted?.participant) {
      target = quoted.participant;
    }

    const number = target.split("@")[0];
    
    // جلب الحالة (Bio)
    let bio = "لا يوجد بايو";
    try {
      const statusData = await sock.fetchStatus(target);
      bio = statusData?.status || bio;
    } catch {}

    // جلب الصورة الشخصية
    let ppUrl = null;
    try {
      ppUrl = await sock.profilePictureUrl(target, "image");
    } catch {}

    // فحص الرتبة إذا كان الأمر داخل مجموعة
    let role = "عضو";
    if (from.endsWith("@g.us")) {
      try {
        const groupMetadata = await sock.groupMetadata(from);
        const member = groupMetadata.participants.find(p => p.id === target);
        if (member?.admin === "superadmin") role = "منشئ الجروب 👑";
        else if (member?.admin === "admin") role = "مشرف 🛡️";
      } catch {}
    }

    const infoText = `
👤 *معلومات الحساب:*

📱 *الرقم:* +${number}
💬 *البايو:* ${bio}
🏷️ *الرتبة:* ${role}
🔗 *رابط المراسلة:* https://wa.me/${number}
`;

    if (ppUrl) {
      await sock.sendMessage(from, { 
        image: { url: ppUrl }, 
        caption: infoText.trim() 
      }, { quoted: m });
    } else {
      await sock.sendMessage(from, { 
        text: infoText.trim() 
      }, { quoted: m });
    }

  } catch (err) {
    console.error("Profile Error:", err);
    await sock.sendMessage(from, { text: "❌ تعذر جلب معلومات هذا الحساب." }, { quoted: m });
  }
}
