// حفظ الفوازير النشطة في الذاكرة العامة للبوت لمنع مسحها عند تكرار الاستدعاء
global.fawazirGames = global.fawazirGames || {};

// قائمة فوازير منوعة مع الكلمات المرادفة للإجابة
const riddlesList = [
  {
    question: "أنا ابن الماء، وإذا تركوني في الماء مت، فمن أنا؟",
    answers: ["الثلج", "ثلج"]
  },
  {
    question: "ما هو الشيء الذي يمشي ويدور بلا أرجل؟",
    answers: ["الساعة", "ساعة"]
  },
  {
    question: "ما هو الشيء الذي إذا أخذت منه يكبر، وإذا أضفت إليه يصغر؟",
    answers: ["الحفرة", "حفرة"]
  },
  {
    question: "شيء يملأ الغرفة ولا يأخذ أي مساحة، ما هو؟",
    answers: ["النور", "الضوء", "نور", "ضوء"]
  },
  {
    question: "ما هو الشيء الذي يكسو الناس ولكنه يظل عارياً؟",
    answers: ["الإبرة", "الابرة", "ابرة", "إبرة"]
  },
  {
    question: "كله ثقوب ومع ذلك يحفظ الماء، فمن هو؟",
    answers: ["الإسفنج", "الاسفنج", "اسفنج", "إسفنج"]
  },
  {
    question: "أسمع بلا أذن وأتكلم بلا لسان، فمن أنا؟",
    answers: ["صدى الصوت", "الصدى", "صدى"]
  }
];

// دالة لتنظيف وتوحيد الحروف العربية للمقارنة الدقيقة
function normalizeArabic(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // إزالة التشكيل
    .replace(/^(ال)/, "");           // إزالة الـ التعريف لتسهيل المطابقة
}

export default async function (sock, m, from, args, config) {
  const input = args.join(" ").trim();
  const currentGame = global.fawazirGames[from];

  // 1. كشف الحل أو الاستسلام
  if (currentGame && (input === "حل" || input === "استسلام" || input === "انسحاب")) {
    clearTimeout(currentGame.timeout);
    const primaryAnswer = currentGame.answers[0];
    delete global.fawazirGames[from];
    return sock.sendMessage(from, { 
      text: `🏳️ تم كشف الحل!\n💡 الإجابة الصحيحة هي: *${primaryAnswer}*` 
    }, { quoted: m });
  }

  // 2. التحقق من إجابة اللاعب إذا كانت هناك فزورة نشطة
  if (currentGame && input) {
    const cleanInput = normalizeArabic(input);
    const isCorrect = currentGame.answers.some(ans => normalizeArabic(ans) === cleanInput);

    if (isCorrect) {
      clearTimeout(currentGame.timeout);
      const answerGiven = currentGame.answers[0];
      delete global.fawazirGames[from];
      return sock.sendMessage(from, { 
        text: `🎉 *إجابة صحيحة وممتازة!* 👏\nالحل هو بالفعل: *${answerGiven}*` 
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { 
        text: `❌ إجابة خاطئة! فكّر جيداً وحاول مرة أخرى.\n\n🧩 الفزورة: *${currentGame.question}*` 
      }, { quoted: m });
    }
  }

  // 3. التذكير بالفزورة القائمة إذا لم يرسل المستخدم إجابة
  if (currentGame && !input) {
    return sock.sendMessage(from, { 
      text: `⚠️ توجد فزورة نشطة بالفعل!\n\n🧩 *${currentGame.question}*\n\n💡 للإجابة اكتب: *.fawazir [إجابتك]*\n👀 للاستسلام وكشف الحل: *.fawazir حل*` 
    }, { quoted: m });
  }

  // 4. إنشاء فزورة جديدة عند عدم وجود لعبة نشطة
  if (!currentGame && input) {
    return sock.sendMessage(from, { 
      text: "⚠️ لا توجد فزورة نشطة حالياً.\nاكتب *.fawazir* فقط بدون إضافات لبدء فزورة جديدة." 
    }, { quoted: m });
  }

  // اختيار فزورة عشوائية
  const randomRiddle = riddlesList[Math.floor(Math.random() * riddlesList.length)];

  // مؤقت لإلغاء الفزورة تلقائياً بعد دقيقتين في حال عدم التفاعل
  const timeout = setTimeout(async () => {
    if (global.fawazirGames[from]) {
      const ans = global.fawazirGames[from].answers[0];
      delete global.fawazirGames[from];
      await sock.sendMessage(from, { 
        text: `⌛ *انتهى وقت الفزورة!* لم يعرف أحد الحل.\nالإجابة الصحيحة كانت: *${ans}*` 
      });
    }
  }, 120000);

  global.fawazirGames[from] = {
    question: randomRiddle.question,
    answers: randomRiddle.answers,
    timeout
  };

  await sock.sendMessage(from, { 
    text: `🧩 *فزورة جديدة:*\n\n"${randomRiddle.question}"\n\n💡 للإجابة اكتب: *.fawazir [إجابتك]*\n👀 للاستسلام وكشف الحل: *.fawazir حل*` 
  }, { quoted: m });
}
