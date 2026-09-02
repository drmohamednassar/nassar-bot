import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();

  // التحقق من إدخال نص البحث
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة ما تبحث عنه بعد الأمر.\nمثال:\n.pinterest خلفيات أنمي" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث عن الصور في بنترست..." }, { quoted: m });

    let images = [];

    // المحاولة 1: السيرفر الأساسي (Siputzx)
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`, {
        timeout: 10000
      });
      const data = res.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        images = data;
      }
    } catch (e) {
      console.log("Primary Pinterest API failed, trying fallback 1...");
    }

    // المحاولة 2: سيرفر احتياطي أول (BK9)
    if (images.length === 0) {
      try {
        const resBk = await axios.get(`https://bk9.fun/pinterest/search?q=${encodeURIComponent(query)}`, {
          timeout: 10000
        });
        const dataBk = resBk.data?.BK9;
        if (Array.isArray(dataBk) && dataBk.length > 0) {
          images = dataBk;
        }
      } catch (e) {
        console.log("Fallback 1 Pinterest failed, trying fallback 2...");
      }
    }

    // المحاولة 3: سيرفر احتياطي ثانٍ (Agatz)
    if (images.length === 0) {
      try {
        const resAgatz = await axios.get(`https://api.agatz.xyz/api/pinterest?message=${encodeURIComponent(query)}`, {
          timeout: 10000
        });
        const dataAgatz = resAgatz.data?.data;
        if (Array.isArray(dataAgatz) && dataAgatz.length > 0) {
          images = dataAgatz;
        }
      } catch (e) {
        console.log("All Pinterest APIs failed.");
      }
    }

    if (images.length === 0) throw new Error("No images found");

    // اختيار صورة عشوائية من نتائج البحث لتنوع الردود
    const randomItem = images[Math.floor(Math.random() * images.length)];
    const imageUrl = typeof randomItem === "string" ? randomItem : (randomItem.images_url || randomItem.image || randomItem.url);

    if (!imageUrl) throw new Error("Image URL not found in result");

    // إرسال الصورة للمستخدم
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: `📌 نتيجة البحث عن: *${query}*`
    }, { quoted: m });

  } catch (error) {
    console.error("Pinterest Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر العثور على صور مطابقة للبحث. جرب كلمات بحث أخرى." 
    }, { quoted: m });
  }
}
