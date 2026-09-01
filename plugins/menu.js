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

  const captionText = `
╭━━━〔 *WELCOME* 〕━━━╮
┃ 👤 *الاسم:* ${senderName}
┃ 📱 *الرقم:* ${senderNumber}
┃ ⚡ *البينق:* ${latency}ms
┃ ⏱️ *التشغيل:* ${uptime}
┃ 📅 *التاريخ:* ${dateStr}
┃ 🕰️ *الوقت:* ${timeStr}
╰━━━━━━━━━━━━━━━━╯

╭━━━〔 *${config.botName || "BOT"}* 〕━━━╮
┃ 👑 *Owner:* ${config.ownerName || "المطور"}
┃ 💬 [ *مرحباً بك في قائمة الأوامر* ]
╰━━━━━━━━━━━━━━━━╯
`.trim();

  const headerImageUrl = "https://i.postimg.cc/XYtWtSYw/1299888.png";

  try {
    const media = await prepareWAMessageMedia(
      { image: { url: headerImageUrl } },
      { upload: sock.waUploadToServer }
    );

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
        text: `👑 تطوير: ${config.ownerName || "المطور"}`
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📂 قائمة الأقسام والأوامر",
              sections: [
                {
                  title: "📥 1. التحميل والميديا",
                  rows: [
                    { id: `${config.prefix}tiktok`, title: "📥 تيك توك", description: "تحميل فيديو تيك توك بدون علامة مائية" },
                    { id: `${config.prefix}ig`, title: "📸 إنستغرام", description: "تحميل ريلز وبوستات وقصص إنستغرام" },
                    { id: `${config.prefix}ytmp3`, title: "🎵 يوتيوب صوت", description: "تحميل صوتيات من يوتيوب بجودة عالية" },
                    { id: `${config.prefix}ytmp4`, title: "🎬 يوتيوب فيديو", description: "تحميل مقاطع فيديو من يوتيوب" },
                    { id: `${config.prefix}fb`, title: "📘 فيسبوك", description: "تحميل مقاطع الفيديو والريلز من فيسبوك" },
                    { id: `${config.prefix}spotify`, title: "🎧 سبوتيفاي", description: "بحث وتحميل الأغاني من Spotify" },
                    { id: `${config.prefix}sticker`, title: "🎨 تحويل لملصق", description: "تحويل أي صورة أو فيديو إلى استيكر" },
                    { id: `${config.prefix}toimg`, title: "🖼️ تحويل لصورة", description: "تحويل الملصق إلى صورة عادية بالرد" },
                    { id: `${config.prefix}vv`, title: "🔓 كاشف لمرة واحدة", description: "استخراج الميديا المرسلة بخاصية العرض لمرة واحدة" }
                  ]
                },
                {
                  title: "🤖 2. الذكاء الاصطناعي والبحث",
                  rows: [
                    { id: `${config.prefix}ai`, title: "🤖 محادثة GPT", description: "طرح أسئلة والتحدث مع الذكاء الاصطناعي" },
                    { id: `${config.prefix}imagine`, title: "🎨 توليد صور AI", description: "رسم وتصميم صور خيالية بالذكاء الاصطناعي" },
                    { id: `${config.prefix}pinterest`, title: "🖼️ بحث بنترست", description: "جلب صور وخلفيات عالية الدقة من Pinterest" },
                    { id: `${config.prefix}anime`, title: "🎬 معلومات الأنمي", description: "جلب قصة وبوستر وتقييم أي أنمي" },
                    { id: `${config.prefix}wiki`, title: "📚 موسوعة ويكيبيديا", description: "بحث علمي وثقافي شامل" },
                    { id: `${config.prefix}tr`, title: "🌐 الترجمة الفورية", description: "ترجمة النصوص للغة العربية" }
                  ]
                },
                {
                  title: "🎮 3. الألعاب والتحديات",
                  rows: [
                    { id: `${config.prefix}xo`, title: "❌ لعبة إكس-أو (XO) ⭕", description: "لوحة تفاعلية لشخصين داخل الجروب" },
                    { id: `${config.prefix}math`, title: "🧮 تحدي الرياضيات", description: "مسائل حسابية سريعة للأذكياء" },
                    { id: `${config.prefix}fawazir`, title: "🧩 فوازير وألغاز", description: "حزازير ذكية مع خيار كشف الحل" },
                    { id: `${config.prefix}scramble`, title: "🔤 الكلمة المبعثرة", description: "تجميع وترتيب الحروف لتكوين الكلمة" },
                    { id: `${config.prefix}capital`, title: "🏛️ عواصم العالم", description: "مسابقة جغرافية لمعرفة العواصم" },
                    { id: `${config.prefix}wyr`, title: "🤔 لو خيروك", description: "تحديات وأسئلة مقارنة صعبة" },
                    { id: `${config.prefix}tod`, title: "🔥 صراحة أو جرأة", description: "أسئلة محرجة وتحديات قوية" },
                    { id: `${config.prefix}ship`, title: "💘 مقياس التوافق", description: "حساب نسبة التوافق بين عضوين بالمنشن" }
                  ]
                },
                {
                  title: "👥 4. إدارة المجموعات",
                  rows: [
                    { id: `${config.prefix}tagall`, title: "📢 منشن جماعي", description: "عمل منشن لكل أعضاء الجروب" },
                    { id: `${config.prefix}hidetag`, title: "👻 منشن مخفي", description: "إرسال رسالة بمنشن غير مرئي للجميع" },
                    { id: `${config.prefix}group`, title: "🔒 قفل/فتح الشات", description: "التحكم في إرسال الرسائل بالجروب" },
                    { id: `${config.prefix}groupinfo`, title: "📋 بيانات المجموعة", description: "عرض إحصائيات ووصف الجروب" },
                    { id: `${config.prefix}link`, title: "🔗 رابط الجروب", description: "جلب رابط دعوة المجموعة" },
                    { id: `${config.prefix}kick`, title: "🚪 طرد عضو", description: "طرد العضو المحدد من الجروب" },
                    { id: `${config.prefix}promote`, title: "🎖️ ترقية لمشرف", description: "رفع عضو لرتبة مشرف" },
                    { id: `${config.prefix}demote`, title: "🔻 تنزيل مشرف", description: "سحب رتبة الإشراف من عضو" },
                    { id: `${config.prefix}del`, title: "🗑️ حذف رسالة", description: "حذف رسائل الأعضاء المزعجة بالرد" }
                  ]
                },
                {
                  title: "🕋 5. الأوامر الإسلامية",
                  rows: [
                    { id: `${config.prefix}quran`, title: "📖 القرآن الكريم", description: "آيات قرآنية عشوائية مع اسم السورة" },
                    { id: `${config.prefix}azkar`, title: "📿 حصن المسلم", description: "أذكار وأدعية مأثورة مع التكرار" },
                    { id: `${config.prefix}hadith`, title: "📜 الأحاديث النبوية", description: "أحاديث شريفة مع السند والمصدر" }
                  ]
                },
                {
                  title: "🛠️ 6. الأدوات والخدمات",
                  rows: [
                    { id: `${config.prefix}tts`, title: "🎙️ تحويل لنطق صوتي", description: "تحويل النص المكتوب إلى رسالة صوتية" },
                    { id: `${config.prefix}calc`, title: "🧮 آلة حاسبة", description: "إجراء العمليات الحسابية المباشرة" },
                    { id: `${config.prefix}weather`, title: "🌤️ حالة الطقس", description: "فحص درجات الحرارة وسرعة الرياح" },
                    { id: `${config.prefix}qr`, title: "🏁 إنشاء كود QR", description: "تحويل الروابط والنصوص إلى باركود" },
                    { id: `${config.prefix}short`, title: "✂️ تقصير الروابط", description: "اختصار الروابط الطويلة بسرعة" },
                    { id: `${config.prefix}ping`, title: "⚡ فحص الاستجابة", description: "قياس سرعة اتصال السيرفر" }
                  ]
                },
                {
                  title: "🎭 7. الترفيه والتسلية",
                  rows: [
                    { id: `${config.prefix}quote`, title: "💡 حكمة اليوم", description: "اقتباسات وحكم تحفيزية مميزة" },
                    { id: `${config.prefix}joke`, title: "🤣 نكتة مضحكة", description: "نكت فكاهية خفيفة للمجموعات" },
                    { id: `${config.prefix}fact`, title: "🌍 هل تعلم؟", description: "حقائق علمية وغريبة" }
                  ]
                },
                {
                  title: "👤 8. الحساب والدعم",
                  rows: [
                    { id: `${config.prefix}profile`, title: "👤 بروفايلك", description: "عرض تفاصيل حسابك وصورتك ورتبتك" },
                    { id: `${config.prefix}owner`, title: "👑 المطور", description: "بطاقة التواصل مع المطور الأساسي" },
                    { id: `${config.prefix}channel`, title: "📢 القناة الرسمية", description: "رابط قناة تحديثات السورس" }
                  ]
                }
              ]
            })
          }
        ]
      }
    };

    const msg = generateWAMessageFromContent(
      from,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage
          }
        }
      },
      { quoted: m }
    );

    await sock.relayMessage(from, msg.message, { messageId: msg.key.id });

  } catch (err) {
    const fullFallback = `
${captionText}

📥 *الميديا:* tiktok, ig, ytmp3, ytmp4, fb, spotify, sticker, toimg, vv
🤖 *الذكاء والبحث:* ai, imagine, pinterest, anime, wiki, tr
🎮 *الألعاب:* xo, math, fawazir, scramble, capital, wyr, tod, ship
👥 *الجروبات:* tagall, hidetag, group, groupinfo, link, kick, promote, demote, del
🕋 *الإسلاميات:* quran, azkar, hadith
🛠️ *الأدوات:* tts, calc, weather, qr, short, ping
🎭 *الترفيه:* quote, joke, fact
👤 *الدعم:* profile, owner, channel
`.trim();

    await sock.sendMessage(
      from,
      {
        image: { url: headerImageUrl },
        caption: fullFallback
      },
      { quoted: m }
    );
  }
}
