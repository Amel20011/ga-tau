const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  proto,
  generateWAMessageFromContent
} = require("@whiskeysockets/baileys");

const fs = require("fs-extra");
const pino = require("pino");
const config = require("./config");

// Load DB
const db = JSON.parse(fs.readFileSync("./database.json"));

// Auto save DB
setInterval(() => {
  fs.writeFileSync("./database.json", JSON.stringify(db, null, 2));
}, 3000);

// Import menu handler
const storeMenu = require("./lib/store");
const groupMenu = require("./lib/group");
const ownerMenu = require("./lib/owner");
const adminMenu = require("./lib/admin");
const btn = require("./lib/button");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("BOT ONLINE ✓");
    }
  });

  // Message Handler
  sock.ev.on("messages.upsert", async (msg) => {
    try {
      const m = msg.messages[0];
      if (!m.message || m.key.fromMe) return;

      const from = m.key.remoteJid;
      const type = Object.keys(m.message)[0];
      const body =
        type === "conversation"
          ? m.message.conversation
          : type === "extendedTextMessage"
          ? m.message.extendedTextMessage.text
          : "";

      const sender = m.key.participant || m.key.remoteJid;

      // ===== SYSTEM DAFTAR =====
      if (!db.users.includes(sender)) {
        if (body.startsWith("#daftar")) {
          const nama = body.split(" ")[1] || "User";
          db.users.push(sender);

          await sock.sendMessage(from, btn.verifySuccess(nama, m));
          return;
        }

        await sock.sendMessage(from, btn.requestRegister());
        return;
      }

      // ========= COMMAND =========
      const cmd = body.toLowerCase();

      // STORE MENU
      if (cmd === "menu" || cmd === ".menu") {
        return sock.sendMessage(from, btn.mainMenu());
      }

      if (cmd === "store" || cmd === "list" || cmd === "produk") {
        return storeMenu(sock, m);
      }

      // GRUP MENU
      if (cmd === "menu grup" || cmd === "group menu") {
        return groupMenu(sock, m);
      }

      // OWNER MENU
      if (cmd === "owner menu" || cmd === "menu owner") {
        if (!config.owner.includes(sender)) {
          return sock.sendMessage(from, { text: "Kamu bukan owner!" });
        }
        return ownerMenu(sock, m);
      }

      // ADMIN MENU
      if (cmd === "admin menu" || cmd === "menu admin") {
        return adminMenu(sock, m);
      }
    } catch (e) {
      console.log("Error:", e);
    }
  });
}

startBot();
