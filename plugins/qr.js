export default async function (sock, m, from, args, config) {
  const text = args.join(" ");
  if (!text) return sock.sendMessage(from, { text: "⚠️ اكتب النص أو الرابط المراد تحويله لكود QR.\nمثال: .qr https://google.com" }, { quoted: m });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
  await sock.sendMessage(from, { 
    image: { url: qrUrl }, 
    caption: `✅ تم إنشاء رمز QR بنجاح بواسطة *${config.botName}*` 
  }, { quoted: m });
}
