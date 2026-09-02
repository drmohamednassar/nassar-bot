import axios from "axios";

export default async function (sock, m, from, args, config) {
  let lang = "ar";
  let text = args.join(" ").trim();

  // التحقق من تحديد لغة مخصصة مثل (.tts en Hello)
  if (args[0] && args[0].length === 2 && /^[a-z]{2}$/i.test(args[0])) {
    lang = args[0].toLowerCase();
    text = args.slice(1).join(" ").trim();
  }

  // إذا لم يكتب نصاً، التحقق من الرد على رسالة نصية
  if (!text && m.quoted?.text) {
    text = m.quoted.text.trim();
  }

  if (!text) {
    return sock.sendMessage(from, { 
      text: "⚠️ يرجى كتابة النص المراد تحويله لصوت بعد الأمر.\nمثال:\n.tts أهلاً بكم في البوت\nأو للإنجليزية:\n.tts en Welcome to the bot" 
    }, { quoted: m });
  }

  // خدمة جوجل تدعم حد أقصى 200 حرف في الطلب الواحد
  if (text.length > 200) {
    text = text.slice(0, 200);
  }

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

    // جلب ملف الصوت بصيغة ArrayBuffer لمنع تلف البيانات الثنائية
    const response = await axios.get(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      responseType: "arraybuffer",
      timeout: 10000
    });

    const audioBuffer = Buffer.from(response.data);

    // إرسال المقطع بمحددات Mimetype الصحيحة المتوافقة مع أندرويد وآيفون
    await sock.sendMessage(from, {
      audio: audioBuffer,
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: m });

  } catch (error) {
    console.error("TTS Error:", error?.message);
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحويل النص إلى صوت حالياً، تأكد من الاتصال بالإنترنت." 
    }, { quoted: m });
  }
}
