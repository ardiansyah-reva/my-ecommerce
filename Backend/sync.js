// backend/sync.js

const sequelize = require("./db");
require("./models"); 

async function syncDatabase() {
  try {
    console.log("Syncing database...");

    await sequelize.sync({ force: true });
    // alter: true = update tabel tanpa menghapus data
    // force: true 

    console.log("Database synchronized with all tables & relations!");
    process.exit();
  } catch (error) {
    console.error("Failed to sync database:", error);
    process.exit(1);
  }
}

syncDatabase();