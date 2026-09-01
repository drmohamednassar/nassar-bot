function formatUptime(seconds) {
  const pad = (s) => (s < 10 ? "0" : "") + s;
  const hrs = Math.floor(seconds / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export default async function (sock, m, from, args, config = {}) {
  try {
    const startTime = Date.now();
    const prefix = config.prefix || ".";
    const botName = config.botName || "SMART BOT";
    const ownerName = config.ownerName || "المطور";

    const senderJid = m.key.participant || m.key.remoteJid || "";
    const senderNumber = senderJid ? senderJid.split("@")[0] : "مستخدم";
    const senderName = m.pushName || "مستخدم";
    
    const uptime = formatUptime(process.uptime());
    const now = new Date();
    
    const dateStr = now.toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    const timeStr = now.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    const latency = ((Date.now() - startTime) / 1000).toFixed(4);

    const menuMessage = `
╭━━━〔 *WELCOME* 〕━━━╮
┃ 👤 *الاسم:* ${senderName}
┃ 📱 *الرقم:* ${senderNumber}
┃ ⚡ *البينق:* ${latency}s
┃ ⏱️ *التشغيل:* ${uptime}
┃ 📅 *التاريخ:* ${dateStr}
┃ 🕰️ *الوقت:* ${timeStr}
╰━━━━━━━━━━━━━━━━╯

╭━━━〔 *${botName}* 〕━━━╮
┃ 👑 *Owner:* ${ownerName}
┃ 💬 [ *قائمة الأوامر الشاملة* ]
╰━━━━━━━━━━━━━━━━╯

📥 *1. التحميل والميديا:*
├ ${prefix}tiktok ‹رابط›
├ ${prefix}ig ‹رابط›
├ ${prefix}ytmp3 ‹رابط/اسم›
├ ${prefix}ytmp4 ‹رابط/اسم›
├ ${prefix}fb ‹رابط›
├ ${prefix}spotify ‹اسم الأغنية›
├ ${prefix}sticker ‹بالرد على صورة›
├ ${prefix}toimg ‹بالرد على استيكر›
└ ${prefix}vv ‹بالرد على وسائط مرة واحدة›

🤖 *2. الذكاء والبحث:*
├ ${prefix}ai ‹سؤالك›
├ ${prefix}imagine ‹وصف الصورة›
├ ${prefix}pinterest ‹بحث›
├ ${prefix}anime ‹اسم الأنمي›
├ ${prefix}wiki ‹موضوع البحث›
└ ${prefix}tr ‹النص›

🎮 *3. الألعاب والتحديات:*
├ ${prefix}xo ‹لعبة إكس أو›
├ ${prefix}math ‹مسائل رياضية›
├ ${prefix}fawazir ‹حزازير وألغاز›
├ ${prefix}scramble ‹ترتيب الحروف›
├ ${prefix}capital ‹عواصم العالم›
├ ${prefix}wyr ‹لو خيروك›
├ ${prefix}tod ‹صراحة أو جرأة›
└ ${prefix}ship ‹مقياس التوافق›

👥 *4. إدارة المجموعات:*
├ ${prefix}tagall ‹منشن للكل›
├ ${prefix}hidetag ‹منشن مخفي›
├ ${prefix}group ‹open / close›
├ ${prefix}groupinfo ‹معلومات الجروب›
├ ${prefix}link ‹رابط الجروب›
├ ${prefix}kick ‹طرد بالمنشن/الرد›
├ ${prefix}promote ‹رفع مشرف›
├ ${prefix}demote ‹تنزيل مشرف›
└ ${prefix}del ‹حذف رسالة بالرد›

🕋 *5. الإسلاميات:*
├ ${prefix}quran ‹آيات قرآنية›
├ ${prefix}azkar ‹أذكار وأدعية›
└ ${prefix}hadith ‹أحاديث نبوية›

🛠️ *6. الأدوات والخدمات:*
├ ${prefix}tts ‹نص للتحويل لصوت›
├ ${prefix}calc ‹عملية حسابية›
├ ${prefix}weather ‹اسم المدينة›
├ ${prefix}qr ‹نص للباركود›
├ ${prefix}short ‹اختصار رابط›
└ ${prefix}ping ‹فحص الاستجابة›

🎭 *7. الترفيه:*
├ ${prefix}quote ‹حكمة اليوم›
├ ${prefix}joke ‹نكتة›
└ ${prefix}fact ‹هل تعلم›

👤 *8. الحساب والدعم:*
├ ${prefix}profile ‹عرض ملفك›
├ ${prefix}owner ‹رقم المطور›
└ ${prefix}channel ‹قناة البوت›
`.trim();

    await sock.sendMessage(from, { text: menuMessage }, { quoted: m });

  } catch (err) {
    await sock.sendMessage(from, { 
      text: `⚠️ حدث خطأ في تنفيذ القائمة:\n\`\`\`${err.message || err}\`\`\`` 
    }, { quoted: m });
  }
}
