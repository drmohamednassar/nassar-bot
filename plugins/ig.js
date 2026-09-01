import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0];
  if (!url) return sock.sendMessage(from, { text: "⚠️ أرسل رابط ريلز أو منشور إنستغرام بعد الأمر.\nمثال: .ig https://www.instagram.com/reel/..." }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري جلب الفيديو..." }, { quoted: m });
    const res = await axios.get(`https://api.giftedtech.web.id/api/download/instagram?apikey=gifted&url=${encodeURIComponent(url)}`);
    const mediaUrl = res.data?.result?.[0]?.url || res.data?.result?.url;

    if (!mediaUrl) throw new Error("No media");

    await sock.sendMessage(from, {
      video: { url: mediaUrl },
      caption: `✅ تم التحميل بواسطة *${config.botName}*`
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر تحميل الفيديو. تأكد من صحة الرابط." }, { quoted: m });
  }
}
