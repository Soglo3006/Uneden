import pool from "./config/db.js";

(async () => {
  try {
    console.log("🎯 Test - lecture des reviews");

    const result = await pool.query("SELECT * FROM reviews LIMIT 3");
    console.log(result.rows);

    console.log("✅ Test terminé !");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  } finally {
    await pool.end(); // Ferme proprement la connexion
  }
})();

