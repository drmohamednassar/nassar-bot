import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0];
  if (!url) return sock.sendMessage(from, { text: "⚠️ أرسل رابط فيديو فيسبوك بعد الأمر.\nمثال: .fb https://www.facebook.com/reel/xxxxxx" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري تحميل فيديو الفيسبوك..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/download/facebook?apikey=gifted&url=${encodeURIComponent(url)}`);
    const videoUrl = res.data?.result?.hd || res.data?.result?.sd;

    if (!videoUrl) throw new Error("Facebook video not found");

    await sock.sendMessage(from, {
      video: { url: videoUrl },
      caption: `✅ تم تحميل فيديو فيسبوك بواسطة *${config.botName}*`
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر تحميل الفيديو. تأكد أن المنشور عام (Public)." }, { quoted: m });
  }
}
