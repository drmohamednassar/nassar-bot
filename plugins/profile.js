export default async function (sock, m, from, args, config = {}) {
  try {
    const quoted = m.message?.extendedTextMessage?.contextInfo;
    const isGroup = from.endsWith("@g.us");

    // 1. تحديد الهدف بدقة (منشن > رد على رسالة > كاتب الأمر)
    let rawTarget = quoted?.mentionedJid?.[0] 
      || quoted?.participant 
      || (isGroup ? m.key.participant : m.key.remoteJid) 
      || "";

    // 2. تنظيف الرقم من معرف الجهاز ومن أي رموز واستخراج الرقم الصافي
    const cleanNumber = rawTarget.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
    const targetJid = `${cleanNumber}@s.whatsapp.net`;

    if (!cleanNumber) {
      return await sock.sendMessage(from, { text: "❌ تعذر تحديد الحساب المستهدف." }, { quoted: m });
    }

    // 3. جلب الحالة (Bio)
    let bio = "لا يوجد بايو";
    try {
      const statusData = await sock.fetchStatus(targetJid);
      bio = statusData?.status || bio;
    } catch {}

    // 4. جلب الصورة الشخصية
    let ppUrl = null;
    try {
      ppUrl = await sock.profilePictureUrl(targetJid, "image");
    } catch {}

    // 5. فحص الرتبة داخل المجموعات بمطابقة الرقم الصافي
    let role = "عضو";
    if (isGroup) {
      try {
        const groupMetadata = await sock.groupMetadata(from);
        const member = groupMetadata.participants.find(p => {
          const pNumber = p.id.split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
          return pNumber === cleanNumber;
        });
        
        if (member?.admin === "superadmin") role = "منشئ الجروب 👑";
        else if (member?.admin === "admin") role = "مشرف 🛡️";
      } catch {}
    }

    const infoText = `
╭━━━〔 👤 *معلومات الحساب* 〕━━━╮
┃ 📱 *الرقم:* +${cleanNumber}
┃ 🏷️ *الرتبة:* ${role}
┃ 💬 *البايو:* ${bio}
┃ 🔗 *المحادثة:* https://wa.me/${cleanNumber}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

    if (ppUrl) {
      await sock.sendMessage(from, { 
        image: { url: ppUrl }, 
        caption: infoText 
      }, { quoted: m });
    } else {
      await sock.sendMessage(from, { 
        text: infoText 
      }, { quoted: m });
    }

  } catch (err) {
    console.error("Profile Error:", err);
    await sock.sendMessage(from, { text: "❌ تعذر جلب معلومات هذا الحساب." }, { quoted: m });
  }
}
