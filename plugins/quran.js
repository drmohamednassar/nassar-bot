import axios from "axios";

export default async function (sock, m, from) {
  try {
    const randomAyah = Math.floor(Math.random() * 6236) + 1;
    const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`);
    const data = res.data.data;
    const text = `📖 *آية من القرآن الكريم:*\n\n﴿ ${data.text} ﴾\n\n📌 سورة: *${data.surah.name}* (آية ${data.numberInSurah})`;
    await sock.sendMessage(from, { text }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "⚠️ تعذر جلب الآية حالياً." }, { quoted: m });
  }
}
