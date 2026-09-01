import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة اسم الفيديو أو وضع رابط يوتيوب.\nمثال:\n.ytmp4 https://youtu.be/xxxx" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري معالجة وتنزيل الفيديو..." }, { quoted: m });

    let videoUrl = query;
    const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(query);

    if (!isUrl) {
      const searchRes = await axios.get(`https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`);
      videoUrl = searchRes.data?.data?.[0]?.url;
      if (!videoUrl) throw new Error("لم يتم العثور على الفيديو");
    }

    const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(videoUrl)}`);
    const downloadUrl = res.data?.data?.dl;
    const caption = res.data?.data?.title || "Video";

    if (!downloadUrl) throw new Error("تعذر جلب رابط الفيديو");

    await sock.sendMessage(from, {
      video: { url: downloadUrl },
      caption: `🎬 ${caption}`,
      mimetype: "video/mp4"
    }, { quoted: m });

  } catch (error) {
    console.error("YTMP4 Error:", error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحميل الفيديو، تأكد من صحة الرابط." 
    }, { quoted: m });
  }
}
