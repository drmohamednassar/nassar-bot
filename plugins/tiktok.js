import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0];
  if (!url) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى وضع رابط الفيديو بعد الأمر.\nمثال: .tiktok https://vm.tiktok.com/xxxxxx/" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري تحميل الفيديو..." }, { quoted: m });
    const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const result = response.data;

    if (result.code !== 0 || !result.data) throw new Error("API Error");

    const videoUrl = result.data.play;
    const title = result.data.title || "بدون عنوان";

    await sock.sendMessage(from, { 
      video: { url: videoUrl }, 
      caption: `🎬 *${title}*\n\n✅ تم التحميل بواسطة *${config.botName}*` 
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحميل الفيديو. تأكد من صحة الرابط وأن الحساب عام." 
    }, { quoted: m });
  }
}
