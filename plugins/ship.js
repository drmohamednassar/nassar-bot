export default async function (sock, m, from) {
  if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "⚠️ هذا الأمر للمجموعات فقط!" }, { quoted: m });

  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length < 2) {
    return sock.sendMessage(from, { text: "⚠️ قم بعمل منشن لشخصين لحساب التوافق بينهما.\nمثال: .ship @عضو1 @عضو2" }, { quoted: m });
  }

  const percent = Math.floor(Math.random() * 101);
  let comment = "💔 نسبة ضئيلة جداً!";
  if (percent > 80) comment = "💍 توافق أسطوري وانسجام تام!";
  else if (percent > 50) comment = "❤️ علاقة ممتازة وتفاهم رائع!";
  else if (percent > 30) comment = "🤝 أصدقاء فقط!";

  const text = `
💘 *مقياس التوافق والانسجام:*
👤 @${mentions[0].split("@")[0]} ➕ @${mentions[1].split("@")[0]}
📊 *نسبة التوافق:* *${percent}%*
💬 *التقييم:* ${comment}
`.trim();

  await sock.sendMessage(from, { text, mentions }, { quoted: m });
}
