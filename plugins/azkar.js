import axios from "axios";

export default async function (sock, m, from) {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/nawafalqari/azkar-api/master/azkar.json");
    const categories = Object.keys(res.data);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const zekrList = res.data[randomCategory];
    const zekr = zekrList[Math.floor(Math.random() * zekrList.length)];
    const text = `📿 *${randomCategory}*\n\n"${zekr.content}"\n\n🔁 التكرار: ${zekr.count || 1}`;
    await sock.sendMessage(from, { text }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "⚠️ تعذر جلب الذكر حالياً." }, { quoted: m });
  }
}
