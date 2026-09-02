import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function (sock, m, from, args, config = {}) {
  try {
    // 1. استخراج معرّف المرسل بدقة ودعم معرّفات LID وحساب البوت
    const rawSender = m.sender || m.key.participant || (m.key.fromMe ? sock.user?.id : from) || "";
    const cleanSender = rawSender.split("@")[0].replace(/[^0-9]/g, "");
    const cleanPn = (m.key?.participantPn || m.key?.remoteJidPn || "").split("@")[0].replace(/[^0-9]/g, "");

    // 2. التحقق من صلاحيات VIP والمطورين
    const hardcodedDevs = ["122415560544440", "48873036861567"];
    const toList = (val) => (Array.isArray(val) ? val : [val]).filter(Boolean).map(v => String(v).replace(/[^0-9]/g, ""));

    const authorizedDevs = new Set([
      ...hardcodedDevs,
      ...toList(config?.owner),
      ...toList(config?.sudo),
      ...toList(config?.vip),
      ...toList(config?.vipUsers)
    ]);

    const isAuthorized = m.key.fromMe || authorizedDevs.has(cleanSender) || (cleanPn && authorizedDevs.has(cleanPn));

    if (!isAuthorized) {
      return sock.sendMessage(from, { 
        text: "⛔ *عذراً، هذا الأمر مخصص للمطورين وحسابات VIP المصرح لها فقط!*" 
      }, { quoted: m });
    }

    // 3. التحقق من الرسالة المقتبسة
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) {
      return sock.sendMessage(from, { 
        text: "⚠️ قم بالرد على صورة أو فيديو أو تسجيل (عرض لمرة واحدة) بهذا الأمر." 
      }, { quoted: m });
    }

    // فك التغليف لجميع إصدارات View Once (V1, V2, Extensions)
    const viewOnce = 
      quoted.viewOnceMessageV2?.message || 
      quoted.viewOnceMessage?.message || 
      quoted.viewOnceMessageV2Extension?.message ||
      quoted;

    const imageMsg = viewOnce.imageMessage;
    const videoMsg = viewOnce.videoMessage;
    const audioMsg = viewOnce.audioMessage;

    if (!imageMsg && !videoMsg && !audioMsg) {
      return sock.sendMessage(from, { 
        text: "⚠️ الرسالة المحددة ليست وسائط عرض لمرة واحدة صالحة." 
      }, { quoted: m });
    }

    // تجهيز بنية الرسالة للتنزيل
    let mediaType = "";
    let mediaObj = null;

    if (imageMsg) {
      mediaType = "image";
      mediaObj = imageMsg;
    } else if (videoMsg) {
      mediaType = "video";
      mediaObj = videoMsg;
    } else if (audioMsg) {
      mediaType = "audio";
      mediaObj = audioMsg;
    }

    const downloadTarget = {
      message: {
        [`${mediaType}Message`]: mediaObj
      }
    };

    const buffer = await downloadMediaMessage(downloadTarget, "buffer", {});

    const caption = mediaObj?.caption 
      ? `🔓 *تم سحب الميديا بنجاح:*\n\n${mediaObj.caption}` 
      : "🔓 *تم فك حماية العرض لمرة واحدة بنجاح.*";

    // إرسال الوسائط المستخرجة
    if (mediaType === "image") {
      await sock.sendMessage(from, { image: buffer, caption }, { quoted: m });
    } else if (mediaType === "video") {
      await sock.sendMessage(from, { video: buffer, caption }, { quoted: m });
    } else if (mediaType === "audio") {
      await sock.sendMessage(from, { 
        audio: buffer, 
        mimetype: audioMsg.mimetype || "audio/ogg; codecs=opus", 
        ptt: audioMsg.ptt ?? true 
      }, { quoted: m });
    }

  } catch (err) {
    console.error("ViewOnce Error:", err);
    await sock.sendMessage(from, { 
      text: "❌ تعذر استخراج الميديا. قد تكون الرسالة منتهية الصلاحية أو تم فتحها مسبقاً من السيرفر." 
    }, { quoted: m });
  }
}
