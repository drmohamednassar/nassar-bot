import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

function formatUptime(seconds) {
  const pad = (s) => (s < 10 ? "0" : "") + s;
  const hrs = Math.floor(seconds / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export default async function (sock, m, from, args, config) {
  const startTime = Date.now();

  const senderJid = m.key.participant || m.key.remoteJid;
  const senderNumber = senderJid.split("@")[0];
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

  const captionText = `
╭━━━〔 *WELCOME* 〕━━━╮
┃ 👤 *الاسم:* ${senderName}
┃ 📱 *الرقم:* ${senderNumber}
┃ ⚡ *البينق:* ${latency}ms
┃ ⏱️ *التشغيل:* ${uptime}
┃ 📅 *التاريخ:* ${dateStr}
┃ 🕰️ *الوقت:* ${timeStr}
╰━━━━━━━━━━━━━━━━╯

╭━━━〔 *${config.botName}* 〕━━━╮
┃ 👑 *Owner:* ${config.ownerName}
┃ 💬 [ *مرحباً بك في البوت الأسرع* ]
╰━━━━━━━━━━━━━━━━╯
`.trim();

  const headerImageUrl = "https://images.wallpapersden.com/image/download/kurumi-tokisaki-date-a-live-anime-girl_bW1sZ2aUmZqaraWkpJRmZ21lrWxnZQ.jpg";

  try {
    const media = await prepareWAMessageMedia({ image: { url: headerImageUrl } }, { upload: sock.waUploadToServer });

    const interactiveMessage = {
      header: {
        title: `⚡ ${latency}ms\n`,
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      body: {
        text: captionText
      },
      footer: {
        text: `👑 تطوير: ${config.ownerName}`
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📂 قائمة الأوامر الكاملة",
              sections: [
                {
                  title: "📥 أوامر التحميل والميديا",
                  rows: [
                    { id: `${config.prefix}tiktok`, title: "📥 تحميل تيك توك", description: "تحميل مقاطع تيك توك بدون علامة مائية" },
                    { id: `${config.prefix}ig`, title: "📸 تحميل إنستغرام", description: "تحميل ريلز وبوستات وقصص إنستغرام" }
                  ]
                },
                {
                  title: "🤖 الذكاء الاصطناعي والمعرفة",
                  rows: [
                    { id: `${config.prefix}ai`, title: "🤖 محادثة GPT", description: "طرح أسئلة والتحدث مع الذكاء الاصطناعي" },
                    { id: `${config.prefix}wiki`, title: "📚 بحث ويكيبيديا", description: "جلب معلومات ومقالات من ويكيبيديا" },
                    { id: `${config.prefix}tr`, title: "🌐 ترجمة فورية", description: "ترجمة أي نص للغة العربية" }
                  ]
                },
                {
                  title: "👥 إدارة المجموعات",
                  rows: [
                    { id: `${config.prefix}tagall`, title: "📢 منشن جماعي", description: "عمل منشن لجميع أعضاء الجروب" },
                    { id: `${config.prefix}hidetag`, title: "👻 منشن مخفي", description: "إرسال رسالة بمنشن غير مرئي للجميع" },
                    { id: `${config.prefix}groupinfo`, title: "📋 بيانات الجروب", description: "عرض عدد الأعضاء والمشرفين والوصف" },
                    { id: `${config.prefix}link`, title: "🔗 رابط الجروب", description: "جلب رابط دعوة المجموعة" },
                    { id: `${config.prefix}kick`, title: "🚪 طرد عضو", description: "طرد العضو المحدد من الجروب" },
                    { id: `${config.prefix}promote`, title: "🎖️ ترقية لمشرف", description: "إعطاء رتبة مشرف لعضو" },
                    { id: `${config.prefix}demote`, title: "🔻 تنزيل رتبة", description: "سحب رتبة المشرف من عضو" },
                    { id: `${config.prefix}del`, title: "🗑️ حذف رسالة", description: "حذف رسالة مزعجة بالرد عليها" }
                  ]
                },
                {
                  title: "🕋 الأوامر الإسلامية",
                  rows: [
                    { id: `${config.prefix}quran`, title: "📖 آية قرآنية", description: "آية عشوائية وتفسيرها واسم السورة" },
                    { id: `${config.prefix}azkar`, title: "📿 أذكار وأدعية", description: "أذكار مأثورة من حصن المسلم" }
                  ]
                },
                {
                  title: "🛠️ الأدوات والخدمات",
                  rows: [
                    { id: `${config.prefix}calc`, title: "🧮 آلة حاسبة", description: "حساب العمليات الرياضية المباشرة" },
                    { id: `${config.prefix}weather`, title: "🌤️ حالة الطقس", description: "معرفة درجات الحرارة والرطوبة" },
                    { id: `${config.prefix}qr`, title: "🏁 إنشاء كود QR", description: "تحويل النص أو الرابط إلى باركود" },
                    { id: `${config.prefix}short`, title: "✂️ اختصار الروابط", description: "تقصير الروابط الطويلة بسرعة" },
                    { id: `${config.prefix}ping`, title: "⚡ فحص الاستجابة", description: "فحص سرعة استجابة السيرفر" }
                  ]
                },
                {
                  title: "🎭 الترفيه والتسلية",
                  rows: [
                    { id: `${config.prefix}quote`, title: "💡 حكمة اليوم", description: "اقتباسات وحكم تحفيزية عشوائية" },
                    { id: `${config.prefix}joke`, title: "🤣 نكتة مضحكة", description: "نكت فكاهية خفيفة" },
                    { id: `${config.prefix}fact`, title: "🌍 هل تعلم؟", description: "حقائق ومعلومات علمية مدهشة" }
                  ]
                },
                {
                  title: "👤 الحساب والمطور",
                  rows: [
                    { id: `${config.prefix}profile`, title: "👤 بروفايلك", description: "عرض معلومات حسابك ورتبتك" },
                    { id: `${config.prefix}owner`, title: "👑 المطور", description: "إرسال بطاقة جهة اتصال المطور" },
                    { id: `${config.prefix}join`, title: "🚪 انضمام لجروب", description: "دخول البوت لجروب عبر الرابط (مطور)" },
                    { id: `${config.prefix}bc`, title: "📢 إذاعة عامة", description: "إرسال إعلان لكل الجروبات (مطور)" },
                    { id: `${config.prefix}leave`, title: "👋 مغادرة الجروب", description: "خروج البوت من المجموعة (مطور)" }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    const msg = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          interactiveMessage
        }
      }
    }, { quoted: m });

    await sock.relayMessage(from, msg.message, { messageId: msg.key.id });

  } catch (err) {
    const fullMenuFallback = `
${captionText}

📥 *أوامر الميديا:*
* ${config.prefix}tiktok [رابط]
* ${config.prefix}ig [رابط]

🤖 *الذكاء والمعرفة:*
* ${config.prefix}ai [سؤال]
* ${config.prefix}wiki [موضوع]
* ${config.prefix}tr [نص]

👥 *إدارة المجموعات:*
* ${config.prefix}tagall | ${config.prefix}hidetag
* ${config.prefix}kick | ${config.prefix}promote | ${config.prefix}demote
* ${config.prefix}link | ${config.prefix}groupinfo | ${config.prefix}del

🕋 *الإسلاميات:*
* ${config.prefix}quran | ${config.prefix}azkar

🛠️ *الأدوات:*
* ${config.prefix}calc | ${config.prefix}weather | ${config.prefix}qr
* ${config.prefix}short | ${config.prefix}ping

🎭 *الترفيه:*
* ${config.prefix}quote | ${config.prefix}joke | ${config.prefix}fact

👤 *الحساب والمطور:*
* ${config.prefix}profile | ${config.prefix}owner
* ${config.prefix}join | ${config.prefix}bc | ${config.prefix}leave
`.trim();

    await sock.sendMessage(from, {
      image: { url: headerImageUrl },
      caption: fullMenuFallback
    }, { quoted: m });
  }
}
