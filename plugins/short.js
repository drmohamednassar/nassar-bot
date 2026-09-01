import axios from "axios";

export default async function (sock, m, from, args) {
  const url = args[0];
  if (!url) return sock.sendMessage(from, { text: "⚠️ ضع الرابط الطويل المراد اختصاره.\nمثال: .short https://example.com/very-long-url" }, { quoted: m });

  try {
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    await sock.sendMessage(from, { text: `✂️ *الرابط المختصر:*\n${res.data}` }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ فشل اختصار الرابط، تأكد من صحة الرابط." }, { quoted: m });
  }
}
