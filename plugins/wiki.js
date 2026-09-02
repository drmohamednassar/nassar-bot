import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();

  // التحقق من إدخال نص البحث
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة موضوع البحث بعد الأمر.\nمثال:\n.wiki الذكاء الاصطناعي\nأو\n.wiki Albert Einstein" 
    }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري البحث في ويكيبيديا..." }, { quoted: m });

    // تحديد لغة البحث تلقائياً (عربي أو إنجليزي)
    const isEnglish = /^[A-Za-z0-9\s.,?!'-]+$/.test(query);
    const lang = isEnglish ? "en" : "ar";

    // ترويسة ضرورية لمنع حظر الطلبات من سيرفرات ويكيبيديا
    const headers = {
      "User-Agent": "NassarBot/1.0 (https://replit.com; WhatsAppBot)"
    };

    // 1. البحث عن أقرب عنوان مطابق عبر OpenSearch
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json`;
    const searchRes = await axios.get(searchUrl, { headers, timeout: 10000 });

    const matchedTitle = searchRes.data?.[1]?.[0];
    if (!matchedTitle) {
      throw new Error("Page not found");
    }

    // 2. جلب الملخص والصورة عبر واجهة REST الرسمية
    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(matchedTitle)}`;
    const summaryRes = await axios.get(summaryUrl, { headers, timeout: 10000 });
    const data = summaryRes.data;

    const title = data.title || matchedTitle;
    const description = data.description ? `_${data.description}_\n\n` : "";
    const extract = data.extract || "لا يوجد ملخص متاح لهذا المقال.";
    const articleUrl = data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(matchedTitle)}`;
    const thumbnail = data.thumbnail?.source || data.originalimage?.source;

    // تجهيز نص الرد
    const message = `📚 *ويكيبيديا: ${title}*\n\n${description}${extract}\n\n🔗 *رابط المقال كامل:*\n${articleUrl}`;

    // 3. إرسال النتيجة (مع صورة إن وُجدت للمقال)
    if (thumbnail) {
      await sock.sendMessage(from, {
        image: { url: thumbnail },
        caption: message
      }, { quoted: m });
    } else {
      await sock.sendMessage(from, { 
        text: message 
      }, { quoted: m });
    }

  } catch (error) {
    console.error("Wikipedia Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ لم يتم العثور على نتائج للبحث. تأكد من صحة الكلمة وتجنب الأخطاء الإملائية." 
    }, { quoted: m });
  }
}
