const words = [
  "برمجة", "حاسوب", "واتساب", "فلسطين", "القاهرة", "ذكاء",
  "خوارزمية", "مستشفى", "طبيعة", "طائرة", "أخطبوط", "مجرة"
];

const activeScrambles = new Map();

function shuffleWord(word) {
  return word.split("").sort(() => Math.random() - 0.5).join(" - ");
}

export default async function (sock, m, from, args) {
  const current = activeScrambles.get(from);
  const guess = args.join(" ").trim();

  // التحقق من التخمين
  if (guess && current) {
    if (guess === current.word) {
      activeScrambles.delete(from);
      const sender = (m.key.participant || m.key.remoteJid).split("@")[0];
      return sock.sendMessage(from, {
        text: `🎊 *صحيح! أحسنت التخمين!* 🏆\n\n👤 الفائز: @${sender}\n📝 الكلمة الأصلية هي: *${current.word}*`,
        mentions: [m.key.participant || m.key.remoteJid]
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { text: "❌ محاولة خاطئة، ركز في الحروف وحاول مجدداً!" }, { quoted: m });
    }
  }

  // توليد كلمة مبعثرة جديدة
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const scrambled = shuffleWord(randomWord);

  activeScrambles.set(from, { word: randomWord });

  const msg = `
🔤 *تحدي ترتيب الكلمة المبعثرة:*

رتب الحروف التالية لتكوين كلمة مفيدة:
👉 [ *${scrambled}* ]

💡 أرسل الكلمة هكذا: *.scramble [الكلمة]*
`.trim();

  await sock.sendMessage(from, { text: msg }, { quoted: m });
}
