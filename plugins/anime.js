import axios from "axios";

export default async function (sock, m, from, args) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب اسم الأنمي بالإنجليزية.\nمثال: .anime Attack on Titan" }, { quoted: m });

  try {
    await sock.sendMessage(from, { text: "⏳ جاري جلب بيانات الأنمي..." }, { quoted: m });
    const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
    const anime = res.data?.data?.[0];

    if (!anime) return sock.sendMessage(from, { text: "❌ لم يتم العثور على نتائج لهذا الأنمي." }, { quoted: m });

    const info = `🎬 *الاسم:* ${anime.title} (${anime.title_japanese || ""})
⭐ *التقييم:* ${anime.score || "غير متوفر"}
🎞️ *عدد الحلقات:* ${anime.episodes || "مستمر"}
📅 *سنة الإصدار:* ${anime.year || anime.aired?.string || "غير محدد"}
🏷️ *التصنيف:* ${anime.genres?.map(g => g.name).join(", ")}

📖 *القصة:*
${anime.synopsis ? anime.synopsis.slice(0, 300) + "..." : "لا يتوفر ملخص"}`;

    await sock.sendMessage(from, {
      image: { url: anime.images.jpg.large_image_url },
      caption: info
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر جلب تفاصيل الأنمي حالياً." }, { quoted: m });
  }
}
