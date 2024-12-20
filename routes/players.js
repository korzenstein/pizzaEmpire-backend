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

router.post("/:playerID/goFundMe", async (req, res) => {
  const { playerID } = req.params;

  try {
    // Fetch the player's current income
    const { data: player, error: playerError } = await supabase
      .from("Players")
      .select("income")
      .eq("playerID", playerID)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (player.income >= 10) {
      return res.status(400).json({ error: "Player does not need Go Fund Me" });
    }

    // Increment the player's income by $1
    const newIncome = Math.min(player.income + 1, 10); // Ensure income doesn't exceed $10
    const { error: updateError } = await supabase
      .from("Players")
      .update({ income: newIncome })
      .eq("playerID", playerID);

    if (updateError) {
      console.error("Error updating income:", updateError);
      return res.status(500).json({ error: "Failed to update income" });
    }

    res.status(200).json({ message: "Income incremented by $1", income: newIncome });
  } catch (err) {
    console.error("Error in Go Fund Me endpoint:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
