import localtunnel from "localtunnel";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 5000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");

(async () => {
  try {
    console.log(`🔧 Opening tunnel to localhost:${PORT}...`);
    const tunnel = await localtunnel({ port: Number(PORT) });

    console.log(`\n✅ Tunnel is live!`);
    console.log(`🌍 Public URL: ${tunnel.url}`);
    console.log(`📡 Telegram webhook: ${tunnel.url}/api/telegram/webhook\n`);

    // Auto-update TELEGRAM_WEBHOOK_URL in .env
    if (fs.existsSync(envPath)) {
      let env = fs.readFileSync(envPath, "utf8");
      env = env.replace(
        /^TELEGRAM_WEBHOOK_URL=.*/m,
        `TELEGRAM_WEBHOOK_URL=${tunnel.url}`
      );
      fs.writeFileSync(envPath, env, "utf8");
      console.log(`✏️  Updated .env → TELEGRAM_WEBHOOK_URL=${tunnel.url}`);
    }

    // Auto-register webhook with Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      console.log(`\n📡 Registering webhook with Telegram...`);
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `${tunnel.url}/api/telegram/webhook`,
          }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        console.log(`✅ Webhook registered: ${data.description}`);
      } else {
        console.error(`❌ Webhook registration failed: ${data.description}`);
      }
    } else {
      console.log(`⚠️  TELEGRAM_BOT_TOKEN not set — skipping webhook registration`);
      console.log(`   Set it in .env, then run:`);
      console.log(`   curl -X POST http://localhost:${PORT}/api/telegram/setup`);
    }

    console.log(`\n🔄 Tunnel running. Press Ctrl+C to stop.\n`);

    tunnel.on("close", () => {
      console.log("Tunnel closed");
      process.exit(0);
    });

    tunnel.on("error", (err) => {
      console.error("Tunnel error:", err);
    });
  } catch (err) {
    console.error("Failed to open tunnel:", err.message);
    process.exit(1);
  }
})();
