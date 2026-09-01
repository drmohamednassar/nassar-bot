import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default async function (sock, m, from) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.stickerMessage) {
    return sock.sendMessage(from, { text: "⚠️ قم بالرد على ملصق (Sticker) لتحويله إلى صورة." }, { quoted: m });
  }

  try {
    const buffer = await downloadMediaMessage({ message: quoted }, "buffer", {});
    await sock.sendMessage(from, { image: buffer, caption: "🖼️ تم تحويل الملصق إلى صورة بنجاح." }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل تحويل الملصق." }, { quoted: m });
  }
}
