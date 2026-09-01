import axios from "axios";

export default async function (sock, m, from) {
  try {
    const res = await axios.get("https://hadis-api-id.vercel.app/hadith/abu-dawud?page=1&limit=300");
    const items = res.data.items;
    const item = items[Math.floor(Math.random() * items.length)];
    const text = `📜 *حديث نبوي شريف:*\n\n"${item.arab}"\n\n📌 *المصدر:* سنن أبي داود (رقم الحديث: ${item.number})`;
    await sock.sendMessage(from, { text }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "⚠️ تعذر جلب الحديث الشريف حالياً." }, { quoted: m });
  }
}
