module.exports = async (sock, m) => {
  const from = m.key.remoteJid;

  const list = `🛍️ *LIST PRODUCT STORE*  

[1]. ALIGHT MOTION PREMIUM (15)
[2]. CANVA LIFETIME (7)
[3]. CANVA PRO (36)
[4]. CAPCUT PRO (180)
[5]. CAPCUT PRO HEAD (17)
[6]. CHATGPT PLUS (19)
[7]. PICSART PRO (3)
[8]. PRIME VIDEO (2)
[9]. SCRIBD PREMIUM (3)
[10]. SPOTIFY PREMIUM (38)

Klik button di bawah untuk order.`;

  return sock.sendMessage(from, {
    image: { url: "./media/banner_store.jpg" },
    caption: list,
    buttons: [
      { buttonId: "order", buttonText: { displayText: "🛒 Order Produk" }, type: 1 },
      { buttonId: "menu", buttonText: { displayText: "📋 Kembali ke Menu" }, type: 1 }
    ]
  });
};
