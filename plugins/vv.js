import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function (sock, m, from) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const viewOnce = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;

  if (!viewOnce) {
    return sock.sendMessage(from, { text: "⚠️ قم بالرد على صورة أو فيديو (عرض لمرة واحدة) بهذا الأمر." }, { quoted: m });
  }

  try {
    const isImage = !!viewOnce.imageMessage;
    const isVideo = !!viewOnce.videoMessage;
    const mediaMsg = isImage ? { message: { imageMessage: viewOnce.imageMessage } } : { message: { videoMessage: viewOnce.videoMessage } };

    const buffer = await downloadMediaMessage(mediaMsg, "buffer", {});
    const caption = (isImage ? viewOnce.imageMessage.caption : viewOnce.videoMessage.caption) || "🔓 تم فك حماية العرض لمرة واحدة بنجاح";

    if (isImage) {
      await sock.sendMessage(from, { image: buffer, caption }, { quoted: m });
    } else if (isVideo) {
      await sock.sendMessage(from, { video: buffer, caption }, { quoted: m });
    }
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر استخراج الميديا لمرة واحدة." }, { quoted: m });
  }
}
