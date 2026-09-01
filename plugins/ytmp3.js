import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب اسم الأغنية أو ضع رابط يوتيوب.\nمثال: .ytmp3 سورة الكهف" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث والتحميل الصوتي..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(query)}`);
    const downloadUrl = res.data?.result?.download_url;

    if (!downloadUrl) throw new Error("Audio not found");

    await sock.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mp4",
      ptt: false
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل تحميل المقطع الصوتي." }, { quoted: m });
  }
}
