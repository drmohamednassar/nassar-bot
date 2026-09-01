const capitals = [
  { country: "مصر", cap: "القاهرة" },
  { country: "السعودية", cap: "الرياض" },
  { country: "فرنسا", cap: "باريس" },
  { country: "اليابان", cap: "طوكيو" },
  { country: "ألمانيا", cap: "برلين" },
  { country: "المملكة المتحدة", cap: "لندن" },
  { country: "تركيا", cap: "أنقرة" },
  { country: "المغرب", cap: "الرباط" },
  { country: "إيطاليا", cap: "روما" },
  { country: "البرازيل", cap: "برازيليا" }
];

const activeCap = new Map();

export default async function (sock, m, from, args) {
  const current = activeCap.get(from);
  const guess = args.join(" ").trim();

  if (guess && current) {
    if (guess.includes(current.cap) || current.cap.includes(guess)) {
      activeCap.delete(from);
      const sender = (m.key.participant || m.key.remoteJid).split("@")[0];
      return sock.sendMessage(from, {
        text: `🌍 *إجابة صحيحة ومعلومة ممتازة!* ✅\n\n👤 الفائز: @${sender}\n🏛️ عاصمة *${current.country}* هي *${current.cap}*`,
        mentions: [m.key.participant || m.key.remoteJid]
      }, { quoted: m });
    } else {
      return sock.sendMessage(from, { text: "❌ عاصمة غير صحيحة، حاول مجدداً!" }, { quoted: m });
    }
  }

  const item = capitals[Math.floor(Math.random() * capitals.length)];
  activeCap.set(from, item);

  const msg = `
🗺️ *مسابقة عواصم العالم:*

ما هي عاصمة دولة: *${item.country}* ؟ 🏛️

💡 أرسل الإجابة هكذا: *.capital [اسم العاصمة]*
`.trim();

  await sock.sendMessage(from, { text: msg }, { quoted: m });
}
