import { config } from "dotenv";
import app from "./app.js";
config();

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
process.on("SIGINT", async () => {
//   await prisma.$disconnect();
    console.log("Server is shutting down...");
});
