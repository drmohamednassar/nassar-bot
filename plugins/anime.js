import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();

  // التحقق من إدخال اسم الأنمي
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة اسم الأنمي بعد الأمر.\nمثال:\n.anime Jujutsu Kaisen\nأو\n.anime ون بيس" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث عن تفاصيل الأنمي..." }, { quoted: m });

    let animeData = null;

    // 1. المحاولة عبر سيرفر Jikan (MyAnimeList الرسمي - مجاني ومستقر جداً)
    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`, {
        timeout: 10000
      });
      const data = res.data?.data?.[0];
      if (data) {
        animeData = {
          title: data.title || data.title_english || query,
          japaneseTitle: data.title_japanese || "غير متوفر",
          image: data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
          score: data.score ? `${data.score} / 10` : "غير متوفر",
          episodes: data.episodes || "غير معروف",
          status: data.status || "غير محدد",
          genres: data.genres?.map(g => g.name).join(", ") || "عام",
          synopsis: data.synopsis ? (data.synopsis.slice(0, 400) + "...") : "لا يوجد وصف متاح."
        };
      }
    } catch (e) {
      console.log("Jikan API failed, trying Kitsu fallback...");
    }

    // 2. سيرفر احتياطي (Kitsu API) في حال انشغال السيرفر الأول
    if (!animeData) {
      try {
        const resKitsu = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=1`, {
          timeout: 10000
        });
        const item = resKitsu.data?.data?.[0]?.attributes;
        if (item) {
          animeData = {
            title: item.canonicalTitle || query,
            japaneseTitle: item.titles?.ja_jp || "غير متوفر",
            image: item.posterImage?.large || item.posterImage?.original,
            score: item.averageRating ? `${(parseFloat(item.averageRating) / 10).toFixed(1)} / 10` : "غير متوفر",
            episodes: item.episodeCount || "غير معروف",
            status: item.status || "غير محدد",
            genres: "أنمي",
            synopsis: item.synopsis ? (item.synopsis.slice(0, 400) + "...") : "لا يوجد وصف متاح."
          };
        }
      } catch (e) {
        console.log("Kitsu API failed.");
      }
    }

    if (!animeData) {
      throw new Error("Anime not found");
    }

    // تنسيق رسالة الرد
    const caption = `🎌 *تفاصيل الأنمي* 🎌\n\n` +
      `✨ *الاسم:* ${animeData.title}\n` +
      `🇯🇵 *باليابانية:* ${animeData.japaneseTitle}\n` +
      `⭐ *التقييم:* ${animeData.score}\n` +
      `🎬 *عدد الحلقات:* ${animeData.episodes}\n` +
      `📡 *الحالة:* ${animeData.status}\n` +
      `🏷️ *التصنيف:* ${animeData.genres}\n\n` +
      `📖 *نبذة مختصرة:*\n${animeData.synopsis}`;

    // إرسال البوستر مع التفاصيل ككابشن
    if (animeData.image) {
      await sock.sendMessage(from, {
        image: { url: animeData.image },
        caption: caption
      }, { quoted: m });
    } else {
      await sock.sendMessage(from, { text: caption }, { quoted: m });
    }

  } catch (error) {
    console.error("Anime Error:", error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر العثور على الأنمي المطلوب. تأكد من صحة الاسم (يفضل كتابته بالإنجليزية مثل: Naruto أو Attack on Titan)." 
    }, { quoted: m });
  }
}
