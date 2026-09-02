import axios from "axios";

export default async function (sock, m, from, args, config) {
  const query = args.join(" ").trim();

  // التحقق من إدخال سؤال
  if (!query) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة السؤال بعد الأمر.\nمثال:\n.ai ما هي عاصمة فرنسا؟" 
    }, { quoted: m });
  }

  try {
    let replyText = null;

    // 1. المحاولة الأساسية: محرك Pollinations المباشر (سريع وبدون قيود)
    try {
      const res = await axios.get(`https://text.pollinations.ai/${encodeURIComponent(query)}`, {
        timeout: 15000
      });
      if (res.data && typeof res.data === "string" && res.data.length > 0) {
        replyText = res.data;
      }
    } catch (e) {
      console.log("Primary AI failed, trying fallback 1...");
    }

    // 2. سيرفر احتياطي أول (BK9 AI)
    if (!replyText) {
      try {
        const resBK = await axios.get(`https://bk9.fun/ai/chatgpt?q=${encodeURIComponent(query)}`, {
          timeout: 15000
        });
        replyText = resBK.data?.BK9 || resBK.data?.result;
      } catch (e) {
        console.log("Fallback 1 failed, trying fallback 2...");
      }
    }

    // 3. سيرفر احتياطي ثانٍ (Siputzx Gemini)
    if (!replyText) {
      try {
        const resSip = await axios.get(`https://api.siputzx.my.id/api/ai/gemini?query=${encodeURIComponent(query)}`, {
          timeout: 15000
        });
        replyText = resSip.data?.data;
      } catch (e) {
        console.log("All AI endpoints failed.");
      }
    }

    if (!replyText) throw new Error("تعذر جلب رد من محركات الذكاء الاصطناعي");

    // إرسال الإجابة كاقتباس لرسالة المستخدم
    await sock.sendMessage(from, { 
      text: replyText.trim() 
    }, { quoted: m });

  } catch (error) {
    console.error("AI Command Error:", error?.response?.data || error?.message);
    await sock.sendMessage(from, { 
      text: "❌ حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي. حاول مرة أخرى لاحقاً." 
    }, { quoted: m });
  }
}
