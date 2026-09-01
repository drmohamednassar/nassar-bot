export default async function (sock, m, from, args, config = {}) {
  try {
    const senderJid = m.key.participant || m.key.remoteJid || "";
    const senderNumber = senderJid.split("@")[0].replace(/[^0-9]/g, "");
    const prefix = config.prefix || ".";
    const botName = config.botName || "SMART BOT";

    // التحقق من صلاحيات المطور
    const sudoList = Array.isArray(config.sudo) 
      ? config.sudo.map(num => String(num).replace(/[^0-9]/g, ""))
      : [String(config.sudo || "").replace(/[^0-9]/g, "")];

    const isSudo = sudoList.includes(senderNumber);

    if (!isSudo) {
      return sock.sendMessage(from, { 
        text: "⛔ *عذراً، هذه اللوحة مخصصة للمطورين وحسابات VIP المصرح لها فقط!*" 
      }, { quoted: m });
    }

    const startTime = Date.now();
    const latency = ((Date.now() - startTime) / 1000).toFixed(4);

    const vipMessage = `
╭━━━〔 👑 *VIP CONTROL PANEL* 〕━━━╮
┃ 👤 *المطور المعتمد:* +${senderNumber}
┃ 🛡️ *مستوى الصلاحية:* Root / Owner
┃ ⚡ *الاستجابة:* ${latency}s
┃ 🤖 *البوت:* ${botName}
╰━━━━━━━━━━━━━━━━━━━━━━━━╯

👑 *أوامر السيطرة والإذاعة:*
├ ${prefix}bc ‹نص الرسالة للإذاعة لكل الجروبات›
├ ${prefix}join ‹رابط جروب لدخول البوت›
└ ${prefix}leave ‹خروج البوت من الجروب فوراً›

🛡️ *أدوات الإدارة السريعة:*
├ ${prefix}group close ‹قفل الشات فوراً›
├ ${prefix}group open ‹فتح الشات فوراً›
├ ${prefix}del ‹حذف الرسائل بالرد›
├ ${prefix}vv ‹سحب وسائط العرض لمرة واحدة›
├ ${prefix}profile ‹كشف بيانات الحساب بالرد›
└ ${prefix}ping ‹فحص سرعة استجابة السيرفر›
`.trim();

    await sock.sendMessage(from, { text: vipMessage }, { quoted: m });

  } catch (err) {
    await sock.sendMessage(from, { 
      text: `⚠️ حدث خطأ في لوحة VIP:\n\`\`\`${err.message || err}\`\`\`` 
    }, { quoted: m });
  }
}
