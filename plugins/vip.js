export default async function (sock, m, from, args, config) {
  // استخراج رقم المرسل
  const senderNumber = (m.key.participant || m.key.remoteJid).split("@")[0];

  // التحقق من الصلاحية (مقتصر على أرقام sudo فقط)
  if (!config.sudo.includes(senderNumber)) {
    return sock.sendMessage(from, { 
      text: "⛔ *عذراً، هذه القائمة مخصصة للأعضاء المميزين (VIP) والمطورين فقط!*" 
    }, { quoted: m });
  }

  const vipMenuText = `
╭━━━〔 👑 *قائمة أوامر VIP* 〕━━━╮
┃ 👤 *المستخدم المعتمد:* +${senderNumber}
┃ 🛡️ *مستوى الصلاحية:* Full Access (VIP)
╰━━━━━━━━━━━━━━━━━━╯

⚡ *أوامر التحكم والإدارة السريعة:*

🚪 *${config.prefix}join [رابط]*
└ انضمام البوت لأي مجموعة فوراً عبر الرابط.

👋 *${config.prefix}leave*
└ إجبار البوت على مغادرة المجموعة الحالية.

📢 *${config.prefix}bc [الرسالة]*
└ إذاعة وإرسال رسالة لجميع الجروبات في وقت واحد.

📊 *${config.prefix}ping*
└ فحص سرعة الاستجابة واستقرار السيرفر.

👤 *${config.prefix}profile*
└ كشف معلومات الحسابات وحالات الأرقام.

🗑️ *${config.prefix}del*
└ حذف أي رسالة في الجروب بالرد عليها.

───────────────────
👑 *${config.botName}*
`.trim();

  await sock.sendMessage(from, { 
    text: vipMenuText 
  }, { quoted: m });
}
