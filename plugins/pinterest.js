import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب اسم الصورة التي تبحث عنها.\nمثال: .pinterest anime wallpaper" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث في Pinterest..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/search/pinterest?apikey=gifted&query=${encodeURIComponent(query)}`);
    const imgUrl = res.data?.result?.[0] || res.data?.result;

    if (!imgUrl) throw new Error("Not found");

    await sock.sendMessage(from, {
      image: { url: imgUrl },
      caption: `🖼️ *نتيجة البحث عن:* ${query}\n👑 *${config.botName}*`
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر العثور على صور مطابقة للبحث." }, { quoted: m });
  }
}
