// حفظ المسابقات النشطة في الذاكرة العامة للبوت لمنع مسحها
global.capitalGames = global.capitalGames || {};

// قائمة الدول وعواصمها مع مراعاة الاختلافات الإملائية
const countriesList = [
  { country: "مصر", capitals: ["القاهرة", "قاهرة"] },
  { country: "المغرب", capitals: ["الرباط", "رباط"] },
  { country: "السعودية", capitals: ["الرياض", "رياض"] },
  { country: "الجزائر", capitals: ["الجزائر"] },
  { country: "تونس", capitals: ["تونس"] },
  { country: "فلسطين", capitals: ["القدس", "قدس"] },
  { country: "العراق", capitals: ["بغداد"] },
  { country: "سوريا", capitals: ["دمشق"] },
  { country: "لبنان", capitals: ["بيروت"] },
  { country: "الأردن", capitals: ["عمان"] },
  { country: "تركيا", capitals: ["أنقرة", "انقرة"] },
  { country: "اليابان", capitals: ["طوكيو"] },
  { country: "فرنسا", capitals: ["باريس"] },
  { country: "ألمانيا", capitals: ["برلين"] },
  { country: "إسبانيا", capitals: ["مدريد"] },
  { country: "إيطاليا", capitals: ["روما"] },
  { country: "المملكة المتحدة", capitals: ["لندن"] },
  { country: "روسيا", capitals: ["موسكو"] },
  { country: "الصين", capitals: ["بكين"] },
  { country: "الولايات المتحدة الأمريكية", capitals: ["واشنطن", "واشنطن دي سي"] },
  { country: "الإمارات", capitals: ["أبوظبي", "ابوظبي", "أبو ظبي"] },
  { country: "قطر", capitals: ["الدوحة", "دوحة"] },
  { country: "الكويت", capitals: ["الكويت"] },
  { country: "السودان", capitals: ["الخرطوم", "خرطوم"] }
];

// دالة لتنظيف وتوحيد الكلمات العربية للمقارنة الدقيقة
function normalizeArabic(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // إزالة التشكيل
    .replace(/^(ال)/, "");           // إزالة الـ التعريف للمطابقة
}

export default async function (sock, m, from, args, config) {
  const input = args.join(" ").trim();
  const currentGame = global.capitalGames[from];

  // 1. خيار الاستسلام أو كشف الحل
  if (currentGame && (input === "حل" || input === "استسلام" || input === "انسحاب")) {
    clearTimeout(currentGame.timeout);
    const answer = currentGame.capitals[0];
    delete global.capitalGames[from];
    return sock.sendMessage(from, { 
      text: `🏳️ تم كشف الحل!\n💡 عاصمة *${currentGame.country}* هي: *${answer}*` 
    }, { quoted: m });
  }

  // 2. فحص إجابة المستخدم إذا كان هناك سؤال نشط
  if (currentGame && input) {
    const cleanInput = normalizeArabic(input);
    const isCorrect = currentGame.capitals.some(cap => normalizeArabic(cap) === cleanInput);

    if (isCorrect) {
      clearTimeout(currentGame.timeout);
      const answer = currentGame.capitals[0];
      delete global.capitalGames[from];
      return sock.sendMessage(from, { 
        text: `🎉 *إجابة صحيحة وممتازة!* 👏\nعاصمة *${currentGame.country}* هي بالفعل: *${answer}*` 
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { 
        text: `❌ إجابة غير صحيحة! حاول مرة أخرى.\n\nما هي عاصمة دولة: *${currentGame.country}* ؟` 
      }, { quoted: m });
    }
  }

  // 3. التذكير بالسؤال إذا كتب المستخدم الأمر دون إجابة
  if (currentGame && !input) {
    return sock.sendMessage(from, { 
      text: `⚠️ هناك سؤال قائم بالفعل!\n\n🏛️ ما هي عاصمة دولة: *${currentGame.country}* ؟\n\n💡 أرسل الإجابة: *.capital [اسم العاصمة]*\n👀 للاستسلام: *.capital حل*` 
    }, { quoted: m });
  }

  // 4. بدء سؤال جديد واختيار دولة عشوائياً
  const item = countriesList[Math.floor(Math.random() * countriesList.length)];

  // مؤقت زمني لإنهاء السؤال تلقائياً بعد 60 ثانية
  const timeout = setTimeout(async () => {
    if (global.capitalGames[from]) {
      const correctCapital = global.capitalGames[from].capitals[0];
      delete global.capitalGames[from];
      await sock.sendMessage(from, { 
        text: `⌛ *انتهى الوقت!* لم يعرف أحد العاصمة.\nعاصمة *${item.country}* هي: *${correctCapital}*` 
      });
    }
  }, 60000);

  global.capitalGames[from] = {
    country: item.country,
    capitals: item.capitals,
    timeout: timeout
  };

  await sock.sendMessage(from, { 
    text: `🌍 *مسابقة عواصم العالم:*\n\n🏛️ ما هي عاصمة دولة: *${item.country}* ؟\n\n💡 أرسل الإجابة هكذا: *.capital [اسم العاصمة]*\n👀 للاستسلام: *.capital حل*` 
  }, { quoted: m });
}
