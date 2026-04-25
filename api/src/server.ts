import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = 3000;

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`API lancée sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur au démarrage:", error);
    process.exit(1);
  }
}

startServer();