import axios from "axios";

export default async function (sock, m, from, args) {
  const text = args.join(" ");
  if (!text) return sock.sendMessage(from, { text: "⚠️ اكتب النص المراد ترجمته للعربية بعد الأمر.\nمثال: .tr Hello how are you" }, { quoted: m });

  try {
    const res = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|ar`);
    const translation = res.data.responseData.translatedText;
    await sock.sendMessage(from, { text: `🌐 *الترجمة للعربية:*\n\n${translation}` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر إتمام الترجمة حالياً." }, { quoted: m });
  }
}
