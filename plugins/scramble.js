// حفظ الألعاب النشطة في الذاكرة العامة للبوت لمنع مسحها عند تكرار الاستدعاء
global.scrambleGames = global.scrambleGames || {};

// قائمة الكلمات
const wordsList = [
  "فلسطين", "القاهرة", "برمجة", "كمبيوتر", "مستشفى",
  "سيارة", "طائرة", "جامعة", "إنترنت", "هاتف",
  "مكتبة", "طبيب", "مهندس", "رياضيات", "مدرسة"
];

// دالة لتنظيف وتوحيد الحروف العربية للمقارنة الدقيقة
function normalizeArabic(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, ""); // إزالة التشكيل
}

// دالة خلط الحروف عشوائياً مع ضمان اختلاف الترتيب عن الكلمة الأصلية
function scrambleWord(word) {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const result = letters.join("");
  return result === word ? scrambleWord(word) : letters.join(" - ");
}

export default async function (sock, m, from, args, config) {
  const input = args.join(" ").trim();
  const currentGame = global.scrambleGames[from];

  // 1. خيار الاستسلام أو كشف الحل
  if (currentGame && (input === "حل" || input === "استسلام" || input === "انسحاب")) {
    clearTimeout(currentGame.timeout);
    const correctWord = currentGame.word;
    delete global.scrambleGames[from];
    return sock.sendMessage(from, { 
      text: `🏳️ تم كشف الحل!\n💡 الكلمة الصحيحة هي: *${correctWord}*` 
    }, { quoted: m });
  }

  // 2. التحقق من إجابة اللاعب إذا كانت هناك لعبة جارية
  if (currentGame && input) {
    if (normalizeArabic(input) === normalizeArabic(currentGame.word)) {
      clearTimeout(currentGame.timeout);
      const solvedWord = currentGame.word;
      delete global.scrambleGames[from];
      return sock.sendMessage(from, { 
        text: `🎉 *إجابة صحيحة! أحسنت!* 👏\nالكلمة هي بالفعل: *${solvedWord}*` 
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { 
        text: `❌ إجابة خاطئة! فكّر جيداً وحاول مرة أخرى.\n\nالحروف: [ *${currentGame.scrambled}* ]` 
      }, { quoted: m });
    }
  }

  // 3. التذكير بالكلمة الحالية إذا كتب المستخدم .scramble بدون إجابة
  if (currentGame && !input) {
    return sock.sendMessage(from, { 
      text: `⚠️ توجد كلمة قيد الحل بالفعل!\n\n👉 الحروف: [ *${currentGame.scrambled}* ]\n\n💡 أرسل الإجابة هكذا: *.scramble [الكلمة]*\n👀 للاستسلام: *.scramble حل*` 
    }, { quoted: m });
  }

  // 4. بدء تحدي جديد واختيار كلمة عشوائية
  const targetWord = wordsList[Math.floor(Math.random() * wordsList.length)];
  const scrambled = scrambleWord(targetWord);

  // مؤقت لإلغاء التحدي تلقائياً بعد 90 ثانية في حال عدم التفاعل
  const timeout = setTimeout(async () => {
    if (global.scrambleGames[from]) {
      delete global.scrambleGames[from];
      await sock.sendMessage(from, { 
        text: `⌛ *انتهى الوقت!* لم يتمكن أحد من تكوين الكلمة.\nالإجابة الصحيحة كانت: *${targetWord}*` 
      });
    }
  }, 90000);

  global.scrambleGames[from] = {
    word: targetWord,
    scrambled: scrambled,
    timeout: timeout
  };

  await sock.sendMessage(from, { 
    text: `🔤 *تحدي ترتيب الكلمة المبعثرة:*\n\nرتب الحروف التالية لتكوين كلمة مفيدة:\n👉 [ *${scrambled}* ]\n\n💡 أرسل الكلمة هكذا: *.scramble [الكلمة]*\n👀 للاستسلام: *.scramble حل*` 
  }, { quoted: m });
}
