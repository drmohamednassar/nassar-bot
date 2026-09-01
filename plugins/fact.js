export default async function (sock, m, from) {
  const facts = [
    "قلب الحوت الأزرق يزن حوالي 180 كيلوجراماً بحجم سيارة صغيرة.",
    "العسل الطبيعي هو الغذاء الوحيد الذي لا يفسد أبداً عبر آلاف السنين.",
    "الأخطبوط يمتلك ثلاثة قلوب ودمه لونه أزرق.",
    "كوكب الزهرة هو الكوكب الوحيد الذي يدور في اتجاه عقارب الساعة."
  ];
  const fact = facts[Math.floor(Math.random() * facts.length)];
  await sock.sendMessage(from, { text: `🌍 *هل تعلم؟*\n\n${fact}` }, { quoted: m });
}
