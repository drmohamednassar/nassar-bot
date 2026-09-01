import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى إدخال رابط فيديو يوتيوب أو كلمة بحث.\nمثال:\n.ytmp3 https://youtu.be/xxxx" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري جلب المقطع الصوتي وتحميله..." }, { quoted: m });

    // استخراج رابط يوتيوب في حال إدخال رابط مباشر أو البحث
    let videoUrl = query;
    const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(query);

    if (!isUrl) {
      // البحث عن الفيديو أولاً إذا أرسل المستخدم نصاً
      const searchRes = await axios.get(`https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`);
      videoUrl = searchRes.data?.data?.[0]?.url;
      if (!videoUrl) throw new Error("لم يتم العثور على الفيديو");
    }

    // جلب رابط التحميل عبر API مستقر
    const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
    const downloadUrl = res.data?.data?.dl;
    const title = res.data?.data?.title || "Audio";

    if (!downloadUrl) throw new Error("رابط التحميل غير متاح");

    await sock.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mp4",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (error) {
    console.error("YTMP3 Error:", error?.message);
    await sock.sendMessage(from, { 
      text: "❌ فشل تحميل المقطع الصوتي. تأكد من أن الرابط صالح أو جرب رابطاً آخر." 
    }, { quoted: m });
  }
}
