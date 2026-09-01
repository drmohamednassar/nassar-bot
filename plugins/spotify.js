import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب اسم الأغنية أو المؤدي.\nمثال: .spotify Amr Diab" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث في Spotify..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/search/spotifysearch?apikey=gifted&query=${encodeURIComponent(query)}`);
    const track = res.data?.results?.[0] || res.data?.result?.[0];

    if (!track) throw new Error("Not found");

    const info = `
🎵 *Spotify Track:*

🏷️ *العنوان:* ${track.title || track.name}
👤 *الفنان:* ${track.artist || track.artists}
⏱️ *المدة:* ${track.duration || "غير محدد"}
🔗 *رابط الاستماع:* ${track.url || track.link}
`.trim();

    await sock.sendMessage(from, {
      image: { url: track.image || track.thumbnail },
      caption: info
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر العثور على الأغنية في سبوتيفاي." }, { quoted: m });
  }
}
