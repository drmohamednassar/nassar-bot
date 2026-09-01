export default async function (sock, m, from) {
  const quotes = [
    "لا تتوقف عندما تتعب، توقف عندما تنتهي.",
    "النجاح ليس عدم ارتكاب الأخطاء، بل عدم تكرارها.",
    "كل يوم هو فرصة جديدة لبداية أفضل.",
    "السر في المضي قدماً هو أن تبدأ.",
    "من أراد النجاح استسهل الصعاب."
  ];
  const item = quotes[Math.floor(Math.random() * quotes.length)];
  await sock.sendMessage(from, { text: `💡 *حكمة اليوم:*\n\n"${item}"` }, { quoted: m });
}
