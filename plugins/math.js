const activeMath = new Map();

export default async function (sock, m, from, args) {
  const input = args.join(" ").trim();
  const current = activeMath.get(from);

  // إذا كانت هناك مسألة قائمة ويحاول المستخدم الإجابة
  if (input && current) {
    const userAnswer = parseFloat(input);
    if (userAnswer === current.answer) {
      activeMath.delete(from);
      const sender = (m.key.participant || m.key.remoteJid).split("@")[0];
      return sock.sendMessage(from, {
        text: `🎯 *إجابة صحيحة وعبقرية!* 🧠✨\n\n👤 الفائز: @${sender}\n📊 الناتج الصحيح هو: *${current.answer}*`,
        mentions: [m.key.participant || m.key.remoteJid]
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { text: "❌ إجابة خاطئة، حاول مرة أخرى!" }, { quoted: m });
    }
  }

  // توليد مسألة حسابية جديدة
  const num1 = Math.floor(Math.random() * 50) + 1;
  const num2 = Math.floor(Math.random() * 30) + 1;
  const operators = ["+", "-", "*"];
  const op = operators[Math.floor(Math.random() * operators.length)];

  let ans = 0;
  if (op === "+") ans = num1 + num2;
  else if (op === "-") ans = num1 - num2;
  else if (op === "*") ans = num1 * num2;

  activeMath.set(from, { answer: ans, time: Date.now() });

  const qText = `
🧮 *تحدي الرياضيات السريع:*

احسب الناتج بأسرع ما يمكن:
👉 *${num1} ${op} ${num2} = ؟*

💡 أرسل الإجابة هكذا: *.math [الناتج]*
`.trim();

  await sock.sendMessage(from, { text: qText }, { quoted: m });
}
