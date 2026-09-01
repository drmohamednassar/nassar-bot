const riddles = [
  { q: "ما هو الشيء الذي يمشي و يقف وليس له أرجل؟", a: "الساعة" },
  { q: "ما هو الشيء الذي كلما أخذت منه كَبُر؟", a: "الحفرة" },
  { q: "شيء يوجد في السماء وإذا أضفت إليه حرفاً أصبح في الأرض؟", a: "نجم (منجم)" },
  { q: "ما هو الشيء الذي يرى كل شيء ولا يملك عيوناً؟", a: "المرآة" },
  { q: "ما هو الشيء الذي يدخل الماء ولا يبتل؟", a: "الضوء" },
  { q: "له أسنان كثيرة ولكنه لا يعض، فما هو؟", a: "المشط" },
  { q: "ما هو الشيء الذي يقرصك ولا تراه؟", a: "الجوع" },
  { q: "أنا ابن الماء، وإذا تركوني في الماء متّ، فمن أنا؟", a: "الثلج" }
];

const activeRiddles = new Map();

export default async function (sock, m, from, args) {
  const action = args[0]?.toLowerCase();
  const current = activeRiddles.get(from);

  // كشف الحل
  if (action === "حل" || action === "حلها" || action === "answer") {
    if (!current) return sock.sendMessage(from, { text: "⚠️ لا توجد فزورة نشطة حالياً. اكتب `.fawazir` لطلب فزورة جديدة." }, { quoted: m });
    const ans = current.a;
    activeRiddles.delete(from);
    return sock.sendMessage(from, { text: `💡 إجابة الفزورة هي: *${ans}*` }, { quoted: m });
  }

  // محاولة الإجابة
  const guess = args.join(" ").trim();
  if (guess && current) {
    if (guess.includes(current.a) || current.a.includes(guess)) {
      activeRiddles.delete(from);
      const sender = (m.key.participant || m.key.remoteJid).split("@")[0];
      return sock.sendMessage(from, {
        text: `🎉 *إجابة صحيحة وممتازة!* 👏\n\n👤 العبقري: @${sender}\n💡 الإجابة: *${current.a}*`,
        mentions: [m.key.participant || m.key.remoteJid]
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { text: "❌ إجابة خاطئة! فكر جيداً أو اكتب `.fawazir حل` لكشفها." }, { quoted: m });
    }
  }

  // إرسال فزورة جديدة
  const r = riddles[Math.floor(Math.random() * riddles.length)];
  activeRiddles.set(from, r);

  const msg = `
🧩 *فزورة اليوم للأذكياء:*

"${r.q}"

💡 للإجابة اكتب: *.fawazir [إجابتك]*
👀 للاستسلام وكشف الحل: *.fawazir حل*
`.trim();

  await sock.sendMessage(from, { text: msg }, { quoted: m });
}
