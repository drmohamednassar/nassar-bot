export default async function (sock, m, from) {
  const jokes = [
    "مرة واحد اشترى قلم رصاص ومسحه عشان يكتب بيه تاني 😂",
    "واحد عصبي حب يضحك اتنرفز 😂",
    "مرة أستاذ رياضيات اتجوز وخلف زاويتين حادتين 😂",
    "واحد ميكانيكي فتح مطعم سمّاه 'طقم شنبر وسلاطات' 😂"
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(from, { text: `🤣 *نكتة:*\n\n${joke}` }, { quoted: m });
}
