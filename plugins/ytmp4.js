import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0];
  if (!url) return sock.sendMessage(from, { text: "⚠️ أرسل رابط فيديو يوتيوب بعد الأمر.\nمثال: .ytmp4 https://youtu.be/xxxxxx" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري جلب الفيديو من يوتيوب..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/download/ytmp4?apikey=gifted&url=${encodeURIComponent(url)}`);
    const downloadUrl = res.data?.result?.download_url;
    const title = res.data?.result?.title || "فيديو يوتيوب";

    if (!downloadUrl) throw new Error("Video not found");

    await sock.sendMessage(from, {
      video: { url: downloadUrl },
      caption: `🎬 *${title}*\n\n✅ تم التحميل بواسطة *${config.botName}*`
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر تحميل الفيديو، تأكد من صحة الرابط." }, { quoted: m });
  }
}
