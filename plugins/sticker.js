import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function (sock, m, from, args, config) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = m.message?.imageMessage || quoted?.imageMessage;
  const isVideo = m.message?.videoMessage || quoted?.videoMessage;

  if (!isImage && !isVideo) {
    return sock.sendMessage(from, { text: "⚠️ قم بإرسال صورة أو فيديو قصير، أو قم بالرد عليهما بالأمر .s أو .sticker" }, { quoted: m });
  }

  try {
    await sock.sendMessage(from, { text: "⏳ جاري إنشاء الملصق..." }, { quoted: m });
    const targetMsg = quoted ? { message: quoted } : m;
    const buffer = await downloadMediaMessage(targetMsg, "buffer", {});

    await sock.sendMessage(from, {
      sticker: buffer
    }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر تحويل الوسائط إلى ملصق." }, { quoted: m });
  }
}
