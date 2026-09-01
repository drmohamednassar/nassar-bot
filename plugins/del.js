export default async function (sock, m, from) {
  const quoted = m.message?.extendedTextMessage?.contextInfo;
  if (!quoted || !quoted.stanzaId) {
    return sock.sendMessage(from, { text: "⚠️ قم بالرد على الرسالة المراد حذفها بهذا الأمر." }, { quoted: m });
  }

  try {
    const deleteKey = {
      remoteJid: from,
      fromMe: quoted.participant ? false : true,
      id: quoted.stanzaId,
      participant: quoted.participant
    };
    await sock.sendMessage(from, { delete: deleteKey });
  } catch {
    await sock.sendMessage(from, { text: "❌ تعذر حذف الرسالة. تأكد أن البوت يمتلك صلاحية مشرف في الجروب." }, { quoted: m });
  }
}
