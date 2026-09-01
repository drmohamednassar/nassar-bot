import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب سؤالك بعد الأمر.\nمثال: .ai ما هي أسرع وسيلة سفر؟" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "🤖 جاري التفكير..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/ai/gpt4?apikey=gifted&query=${encodeURIComponent(query)}`);
    const reply = res.data?.result || "عذراً، لم أتمكن من الرد.";

    await sock.sendMessage(from, { text: `🤖 *رد الذكاء الاصطناعي:*\n\n${reply}\n\n👑 *${config.botName}*` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي." }, { quoted: m });
  }
}
