// حفظ الألعاب في الذاكرة العامة لمنع مسحها عند تكرار استدعاء الملف
global.xoGames = global.xoGames || {};

export default async function (sock, m, from, args, config) {
  const action = args[0]?.toLowerCase();
  const sender = m.sender || m.key.participant || from;

  // دالة رسم لوحة اللعبة
  const renderBoard = (board) => {
    const emojis = { 1: "1️⃣", 2: "2️⃣", 3: "3️⃣", 4: "4️⃣", 5: "5️⃣", 6: "6️⃣", 7: "7️⃣", 8: "8️⃣", 9: "9️⃣", X: "❌", O: "⭕" };
    return (
      `${emojis[board[0]]} | ${emojis[board[1]]} | ${emojis[board[2]]}\n` +
      `───────────\n` +
      `${emojis[board[3]]} | ${emojis[board[4]]} | ${emojis[board[5]]}\n` +
      `───────────\n` +
      `${emojis[board[6]]} | ${emojis[board[7]]} | ${emojis[board[8]]}`
    );
  };

  // دالة التحقق من الفائز
  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // أفقي
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // رأسي
      [0, 4, 8], [2, 4, 6]             // قطري
    ];
    for (let [a, b, c] of lines) {
      if (board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(cell => cell === "X" || cell === "O")) return "tie";
    return null;
  };

  // 1. بدء لعبة جديدة
  if (action === "بدء" || action === "start") {
    if (global.xoGames[from]) {
      return sock.sendMessage(from, { 
        text: "⚠️ توجد لعبة قائمة بالفعل في هذه المحادثة! اكتب `.xo الغاء` لإنهائها." 
      }, { quoted: m });
    }

    global.xoGames[from] = {
      player1: sender,
      player2: null,
      turn: sender,
      board: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      status: "waiting"
    };

    return sock.sendMessage(from, { 
      text: `🎮 *تم إنشاء لعبة X - O جديدة!*\n\n👤 اللاعب الأول (❌): @${sender.split("@")[0]}\n⏳ بانتظار الخصم...\n\n👉 للانضمام اكتب: *.xo انضمام*`,
      mentions: [sender]
    }, { quoted: m });
  }

  // 2. انضمام الخصم للعبة
  if (action === "انضمام" || action === "join") {
    const game = global.xoGames[from];
    if (!game || game.status !== "waiting") {
      return sock.sendMessage(from, { 
        text: "⚠️ لا توجد لعبة تنتظر خصماً حالياً. اكتب `.xo بدء` لإنشاء لعبة جديدة." 
      }, { quoted: m });
    }

    if (game.player1 === sender) {
      return sock.sendMessage(from, { 
        text: "⚠️ لا يمكنك اللعب ضد نفسك! انتظر لاعباً آخر للانضمام." 
      }, { quoted: m });
    }

    game.player2 = sender;
    game.status = "playing";

    return sock.sendMessage(from, { 
      text: `⚔️ *بدأت اللعبة!*\n\n❌ اللاعب 1: @${game.player1.split("@")[0]}\n⭕ اللاعب 2: @${game.player2.split("@")[0]}\n\nدور اللاعب ❌ للبدء!\n\n${renderBoard(game.board)}\n\n👉 للعب اكتب: *.xo [رقم المربع من 1 إلى 9]*`,
      mentions: [game.player1, game.player2]
    }, { quoted: m });
  }

  // 3. إلغاء اللعبة
  if (action === "الغاء" || action === "إنهاء" || action === "حذف") {
    if (!global.xoGames[from]) {
      return sock.sendMessage(from, { text: "⚠️ لا توجد لعبة قائمة لإلغائها." }, { quoted: m });
    }
    delete global.xoGames[from];
    return sock.sendMessage(from, { text: "🗑️ تم إلغاء اللعبة بنجاح." }, { quoted: m });
  }

  // 4. تنفيذ حركة (اختيار رقم المربع من 1 إلى 9)
  const position = parseInt(action);
  if (!isNaN(position) && position >= 1 && position <= 9) {
    const game = global.xoGames[from];
    if (!game || game.status !== "playing") {
      return sock.sendMessage(from, { 
        text: "⚠️ لا توجد مباراة جارية حالياً. اكتب `.xo بدء` للبدء." 
      }, { quoted: m });
    }

    if (sender !== game.turn) {
      return sock.sendMessage(from, { 
        text: "⏳ ليس دورك الآن! انتظر حتى ينتهي دور الخصم." 
      }, { quoted: m });
    }

    const index = position - 1;
    if (game.board[index] === "X" || game.board[index] === "O") {
      return sock.sendMessage(from, { text: "⚠️ هذا المربع مشغول بالفعل! اختر رقماً آخر." }, { quoted: m });
    }

    const mark = sender === game.player1 ? "X" : "O";
    game.board[index] = mark;

    const result = checkWinner(game.board);

    if (result) {
      let winText = "";
      if (result === "tie") {
        winText = `🤝 *انتهت اللعبة بالتعادل!*`;
      } else {
        const winner = result === "X" ? game.player1 : game.player2;
        winText = `🎉 *مبروك! فاز اللاعب ${result === "X" ? "❌" : "⭕"}* (@${winner.split("@")[0]})!`;
      }

      delete global.xoGames[from];
      return sock.sendMessage(from, {
        text: `${winText}\n\n${renderBoard(game.board)}`,
        mentions: [game.player1, game.player2]
      }, { quoted: m });
    }

    // تبديل الدور
    game.turn = game.turn === game.player1 ? game.player2 : game.player1;
    const nextMark = game.turn === game.player1 ? "❌" : "⭕";

    return sock.sendMessage(from, {
      text: `دور اللاعب ${nextMark}: @${game.turn.split("@")[0]}\n\n${renderBoard(game.board)}`,
      mentions: [game.turn]
    }, { quoted: m });
  }

  // الرسالة الإرشادية في حال كتابة .xo فقط
  await sock.sendMessage(from, {
    text: "🎮 *أوامر لعبة X - O:*\n\n" +
      "🔹 *.xo بدء* : إنشاء لعبة جديدة\n" +
      "🔹 *.xo انضمام* : الانضمام للعبة الحالية\n" +
      "🔹 *.xo [1-9]* : اختيار مربع للعب\n" +
      "🔹 *.xo الغاء* : إنهاء اللعبة الحالية"
  }, { quoted: m });
}
