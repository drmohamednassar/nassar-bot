import axios from "axios";

export default async function (sock, m, from, args) {
  const query = args.join(" ");
  if (!query) return sock.sendMessage(from, { text: "⚠️ اكتب موضوع البحث.\nمثال: .wiki الذكاء الاصطناعي" }, { quoted: m });

  try {
    const res = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = res.data;

    if (!data.extract) throw new Error("Not found");

    const message = `📚 *الموضوع:* ${data.title}\n\n${data.extract}\n\n🔗 *رابط المقال:* ${data.content_urls.desktop.page}`;
    await sock.sendMessage(from, { text: message }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ لم يتم العثور على نتائج للبحث." }, { quoted: m });
  }
}
