// حفظ المسائل النشطة في الذاكرة العامة للبوت
global.mathGames = global.mathGames || {};

export default async function (sock, m, from, args, config) {
  const input = args[0]?.trim();
  const currentGame = global.mathGames[from];

  // 1. إذا كانت هناك مسألة نشطة وقام المستخدم بإرسال إجابة
  if (currentGame && input) {
    // خيار الاستسلام أو الإلغاء
    if (input === "الغاء" || input === "استسلام") {
      clearTimeout(currentGame.timeout);
      delete global.mathGames[from];
      return sock.sendMessage(from, { 
        text: `🏳️ تم إنهاء التحدي. الإجابة الصحيحة كانت: *${currentGame.answer}*` 
      }, { quoted: m });
    }

    const userAnswer = parseInt(input, 10);

    // فحص الإجابة المدخلة
    if (!isNaN(userAnswer)) {
      if (userAnswer === currentGame.answer) {
        clearTimeout(currentGame.timeout);
        delete global.mathGames[from];
        return sock.sendMessage(from, { 
          text: `🎉 *إجابة صحيحة! أحسنت!* 👏\nالناتج هو بالفعل: *${userAnswer}*` 
        }, { quoted: m });
      } else {
        return sock.sendMessage(from, { 
          text: `❌ إجابة غير صحيحة! حاول مرة أخرى.\nالمسألة: *${currentGame.question} = ؟*` 
        }, { quoted: m });
      }
    }
  }

  // 2. إذا كانت هناك مسألة قائمة ولم يرسل المستخدم رقماً
  if (currentGame && !input) {
    return sock.sendMessage(from, { 
      text: `⚠️ توجد مسألة قيد الحل بالفعل!\n👉 *${currentGame.question} = ؟*\n\n💡 أرسل الإجابة هكذا: *.math [الناتج]*\nأو اكتب *.math استسلام* لإلغائها.` 
    }, { quoted: m });
  }

  // 3. إنشاء مسألة حسابية جديدة عشوائية
  const operations = ["+", "-", "*"];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, answer;

  if (op === "+") {
    num1 = Math.floor(Math.random() * 50) + 1;
    num2 = Math.floor(Math.random() * 50) + 1;
    answer = num1 + num2;
  } else if (op === "-") {
    num1 = Math.floor(Math.random() * 50) + 20;
    num2 = Math.floor(Math.random() * num1) + 1; // لضمان ناتج موجب
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * 12) + 2;
    num2 = Math.floor(Math.random() * 12) + 2;
    answer = num1 * num2;
  }

  const opSymbol = op === "*" ? "×" : op;
  const question = `${num1} ${opSymbol} ${num2}`;

  // مؤقت لإلغاء المسألة تلقائياً بعد 60 ثانية في حال عدم الرد
  const timeout = setTimeout(async () => {
    if (global.mathGames[from]) {
      delete global.mathGames[from];
      await sock.sendMessage(from, { 
        text: `⌛ *انتهى الوقت!* لم يتم حل المسألة.\nالإجابة الصحيحة كانت: *${answer}*` 
      });
    }
  }, 60000);

  global.mathGames[from] = {
    question,
    answer,
    timeout
  };

  await sock.sendMessage(from, { 
    text: `🧮 *تحدي الرياضيات السريع:*\n\nاحسب الناتج بأسرع ما يمكن:\n👉 *${question} = ؟*\n\n⏳ لديك 60 ثانية للإجابة.\n💡 أرسل الإجابة هكذا: *.math [الناتج]*` 
  }, { quoted: m });
}
