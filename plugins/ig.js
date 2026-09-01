import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0]?.trim();

  // التحقق من وجود الرابط وصحته
  if (!url || !/instagram\.com\/(p|reel|tv|reels)\/[A-Za-z0-9_-]+/i.test(url)) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى إرسال رابط منشور أو ريلز صالح من إنستغرام.\nمثال:\n.ig https://www.instagram.com/reel/Cxxxxxx/" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري تحميل الفيديو من إنستغرام..." }, { quoted: m });

    let mediaUrl = null;

    // المحاولة عبر السيرفر الأساسي
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`, {
        timeout: 10000
      });
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        mediaUrl = data[0]?.url;
      } else if (data?.url) {
        mediaUrl = data.url;
      }
    } catch (e) {
      console.log("Primary IG API failed, trying fallback...");
    }

    // محاولة عبر سيرفر احتياطي إذا فشل الأول
    if (!mediaUrl) {
      const resFallback = await axios.get(`https://bk9.fun/download/instagram?url=${encodeURIComponent(url)}`, {
        timeout: 10000
      });
      const items = resFallback.data?.BK9;
      if (Array.isArray(items) && items.length > 0) {
        mediaUrl = items[0]?.url;
      }
    }

    if (!mediaUrl) throw new Error("Media not found");

    // إرسال الفيديو للمستخدم
    await sock.sendMessage(from, {
      video: { url: mediaUrl },
      caption: "✅ تم التحميل بنجاح",
      mimetype: "video/mp4"
    }, { quoted: m });

  } catch (error) {
    console.error("IG Download Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحميل الفيديو. تأكد أن الحساب عام (Public) وليس خاصاً، وتأكد من صحة الرابط." 
    }, { quoted: m });
  }
}
