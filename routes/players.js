const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// Fetch all players
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("Players").select("*");
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
