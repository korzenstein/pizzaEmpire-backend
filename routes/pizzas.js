const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

router.get("/:playerID/pizzas", async (req, res) => {
  const { playerID } = req.params;

  try {
    // Fetch total pizzas made by the player
    const { data, error } = await supabase
      .from("Pizzas")
      .select("*")
      .eq("playerID", playerID);

    if (error) throw error;

    // Return the total count
    res.status(200).json({ totalPizzas: data.length });
  } catch (error) {
    console.error("Error fetching pizzas:", error.message);
    res.status(500).json({ error: "Failed to fetch pizzas." });
  }
});

module.exports = router;
