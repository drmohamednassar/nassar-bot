import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();

  // التحقق من إدخال نص أو رابط
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة اسم الأغنية أو إرسال رابط التراك من Spotify.\nمثال:\n.spotify Broken Angel\nأو\n.spotify https://open.spotify.com/track/xxxxxx" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث عن الأغنية وتجهيز الملف الصوتي..." }, { quoted: m });

    let trackUrl = query;
    let title = "Spotify Audio";
    let artist = "Spotify";
    let downloadUrl = null;

    const isSpotifyUrl = /open\.spotify\.com\/track\/[A-Za-z0-9]+/i.test(query);

    // 1. إذا كان المدخل نص بحث، نقوم بالبحث لجلب رابط التراك وبياناته
    if (!isSpotifyUrl) {
      try {
        const searchRes = await axios.get(`https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(query)}`, { 
          timeout: 10000 
        });
        const firstResult = searchRes.data?.data?.[0];
        if (firstResult) {
          trackUrl = firstResult.url || firstResult.link;
          title = firstResult.title || firstResult.name || title;
          artist = firstResult.artist || firstResult.artists || artist;
        }
      } catch (e) {
        console.log("Spotify search error, attempting direct resolution...");
      }
    }

    // 2. جلب رابط التحميل (السيرفر الأول: Siputzx)
    try {
      const res = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(trackUrl)}`, { 
        timeout: 15000 
      });
      const data = res.data?.data;
      downloadUrl = data?.download || data?.url || data?.dl;
      if (data?.title) title = data.title;
      if (data?.artist) artist = data.artist;
    } catch (e) {
      console.log("Primary Spotify API failed, trying fallback 1...");
    }

    // 3. سيرفر بديل أول (BK9)
    if (!downloadUrl) {
      try {
        const resBk = await axios.get(`https://bk9.fun/download/spotify?url=${encodeURIComponent(trackUrl)}`, { 
          timeout: 15000 
        });
        const bkData = resBk.data?.BK9;
        downloadUrl = bkData?.url || bkData?.download;
        if (bkData?.title) title = bkData.title;
      } catch (e) {
        console.log("Fallback 1 failed, trying fallback 2...");
      }
    }

    // 4. سيرفر بديل ثانٍ (Agatz)
    if (!downloadUrl) {
      try {
        const resAgatz = await axios.get(`https://api.agatz.xyz/api/spotify?url=${encodeURIComponent(trackUrl)}`, { 
          timeout: 15000 
        });
        downloadUrl = resAgatz.data?.data?.url || resAgatz.data?.data?.download;
      } catch (e) {
        console.log("All Spotify APIs failed.");
      }
    }

    if (!downloadUrl) throw new Error("Download stream not found");

    // إرسال المقطع الصوتي للمستخدم
    await sock.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mp4",
      fileName: `${title} - ${artist}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (error) {
    console.error("Spotify Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر العثور على الأغنية أو تحميلها. تأكد من كتابة الاسم بوضوح أو أرسل رابط المقطع مباشرة." 
    }, { quoted: m });
  }
}
