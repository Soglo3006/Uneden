import pool from "./config/db.js";

(async () => {
  try {
    console.log("🎯 Test - Création d'une review");

    // Simule les données de la requête (req.body)
    const booking_id = "66aac4a1-374f-4907-9cc4-c5e2e310d0bb";  // Change selon ton booking existant
    const rating = 5;
    const comment = "Excellent service!";
    
    // Simule l'utilisateur connecté (req.user.id)
    const current_user_id = 'e14a723c-3fd1-414c-bb24-067de3d39114';  // Change selon ton user

    // Vérifie que le booking existe
    const booking = await pool.query("SELECT * FROM bookings WHERE id = $1", [booking_id]);
    
    if (booking.rows.length === 0) {
      console.log(" Booking not found");
      return;
    }
    console.log(booking);

    console.log(" Booking trouvé:", booking.rows[0]);

    // Vérifie que l'utilisateur fait partie du booking
    const b = booking.rows[0];
    if (b.client_id !== current_user_id && b.worker_id !== current_user_id) {
      console.log(" You are not part of this booking");
      return;
    }

    console.log(" User fait partie du booking");

    // Empêche de noter 2 fois le même booking
    const existingReview = await pool.query(
      `SELECT * FROM reviews WHERE booking_id = $1 AND reviewer_id = $2`,
      [booking_id, current_user_id]
    );
    
    if (existingReview.rows.length > 0) {
      console.log(" You already reviewed this booking");
      return;
    }

    console.log(" Pas de review existante");

    // Détermine la personne notée
    const target_id = b.client_id === current_user_id ? b.worker_id : b.client_id;
    
    console.log(" Target ID:", target_id);

    // Crée la review
    const result = await pool.query(
      `INSERT INTO reviews (booking_id, reviewer_id, target_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [booking_id, current_user_id, target_id, rating, comment]
    );

    console.log(" Review créée avec succès!");
    console.log(result.rows[0]);

  } catch (error) {
    console.error("Erreur:", error.message);
  } finally {
    await pool.end();
  }
})();