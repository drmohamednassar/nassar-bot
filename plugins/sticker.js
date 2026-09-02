import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async function (sock, m, from, args, config) {
  try {
    // تحديد الرسالة التي تحتوي على الصورة (سواء كانت مرسلة مباشرة أو مقتبسة عبر الرد)
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";

    if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
      return sock.sendMessage(from, { 
        text: "⚠️ يرجى إرسال صورة مع كتابة .sticker أو الرد على صورة بالرمز .sticker" 
      }, { quoted: m });
    }

    await sock.sendMessage(from, { text: "⏳ جاري إنشاء الملصق..." }, { quoted: m });

    // تنزيل بيانات الصورة الأصلية كـ Buffer
    const mediaBuffer = await downloadMediaMessage(
      quoted,
      "buffer",
      {},
      { logger: console }
    );

    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error("فشل تنزيل ملف الصورة");
    }

    // إنشاء وتحويل الملصق لصيغة WebP المتوافقة مع واتساب
    const sticker = new Sticker(mediaBuffer, {
      pack: "Nassar Bot",        // اسم حزمة الملصقات
      author: "Mohamed Nassar",  // اسم الصانع
      type: StickerTypes.FULL,   // الحفاظ على أبعاد الصورة كاملة
      quality: 70                // جودة مناسبة لسرعة الإرسال
    });

    const stickerBuffer = await sticker.toBuffer();

    // إرسال الملصق الجاهز
    await sock.sendMessage(from, { 
      sticker: stickerBuffer 
    }, { quoted: m });

  } catch (error) {
    console.error("Sticker Error:", error);
    await sock.sendMessage(from, { 
      text: "❌ تعذر تحويل الصورة إلى ملصق. تأكد من إرسال صورة صحيحة." 
    }, { quoted: m });
  }
}
