import axios from "axios";

export default async function (sock, m, from, args) {
  const city = args.join(" ");
  if (!city) return sock.sendMessage(from, { text: "⚠️ اكتب اسم المدينة أو المحافظة.\nمثال: .weather Cairo" }, { quoted: m });

  try {
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const current = res.data.current_condition[0];
    const nearest = res.data.nearest_area[0];

    const weatherText = `
🌤️ *حالة الطقس في ${nearest.areaName[0].value} (${nearest.country[0].value}):*

🌡️ درجة الحرارة: *${current.temp_C}°C*
💨 سرعة الرياح: *${current.windspeedKmph} كم/س*
💧 الرطوبة: *${current.humidity}%*
☁️ الوصف: *${current.lang_ar ? current.lang_ar[0].value : current.weatherDesc[0].value}*
`;
    await sock.sendMessage(from, { text: weatherText.trim() }, { quoted: m });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر العثور على بيانات الطقس لهذه المدينة." }, { quoted: m });
  }
}
