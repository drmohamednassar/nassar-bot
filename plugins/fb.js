import axios from "axios";

export default async function (sock, m, from, args, config) {
  const url = args[0]?.trim();

  // التحقق من صحة رابط فيسبوك
  const fbRegex = /(https?:\/\/)?(www\.|m\.|web\.)?(facebook\.com|fb\.watch|fb\.gg)\/.+$/i;
  if (!url || !fbRegex.test(url)) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى إرسال رابط فيديو أو ريلز صالح من فيسبوك.\nمثال:\n.fb https://fb.watch/xxxxxx/" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري معالجة وتحميل فيديو فيسبوك..." }, { quoted: m });

    let videoUrl = null;
    let title = "Facebook Video";

    // المحاولة 1: السيرفر الأساسي (Siputzx)
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`, {
        timeout: 10000
      });
      const data = res.data?.data;
      // اختيار أعلى جودة متاحة (HD ثم SD)
      videoUrl = data?.urls?.find(v => v.hd)?.hd || data?.urls?.[0]?.sd || data?.urls?.[0]?.url || data?.hd || data?.sd;
      if (data?.title) title = data.title;
    } catch (e) {
      console.log("Primary FB API failed, trying fallback 1...");
    }

    // المحاولة 2: سيرفر احتياطي أول (BK9)
    if (!videoUrl) {
      try {
        const resBK = await axios.get(`https://bk9.fun/download/facebook?url=${encodeURIComponent(url)}`, {
          timeout: 10000
        });
        const bkData = resBK.data?.BK9;
        videoUrl = bkData?.hd || bkData?.sd || bkData?.[0]?.url;
      } catch (e) {
        console.log("Fallback 1 FB API failed, trying fallback 2...");
      }
    }

    // المحاولة 3: سيرفر احتياطي ثانٍ (Agatz)
    if (!videoUrl) {
      try {
        const resAgatz = await axios.get(`https://api.agatz.xyz/api/facebook?url=${encodeURIComponent(url)}`, {
          timeout: 10000
        });
        const agatzData = resAgatz.data?.data;
        videoUrl = agatzData?.hd || agatzData?.sd || agatzData?.[0]?.url;
      } catch (e) {
        console.log("All FB APIs failed.");
      }
    }

    if (!videoUrl) throw new Error("Video stream URL not found");

    // إرسال الفيديو للمستخدم
    await sock.sendMessage(from, {
      video: { url: videoUrl },
      caption: `✅ تم التحميل بنجاح\n📌 ${title}`,
      mimetype: "video/mp4"
    }, { quoted: m });

  } catch (error) {
    console.error("FB Download Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحميل الفيديو. تأكد أن المنشور عام (Public) وليس داخل مجموعة خاصة أو مقيداً بفئة عمرية." 
    }, { quoted: m });
  }
}
