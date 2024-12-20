const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

// Fetch all inventory
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("Inventory").select("*");
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:playerID", async (req, res) => {
  const { playerID } = req.params;

  try {
    const { data, error } = await supabase
      .from("Inventory")
      .select("*")
      .eq("playerID", playerID);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("Error in GET /inventory/:playerID:", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.post("/:playerID/buy", async (req, res) => {
  const { playerID } = req.params;
  const { ingredient, cost } = req.body;

  if (!ingredient || cost === undefined) {
    return res.status(400).json({ error: "Ingredient and cost are required." });
  }

  try {
    // Fetch the player's current income
    const { data: player, error: playerError } = await supabase
      .from("Players")
      .select("income")
      .eq("playerID", playerID)
      .single();

    if (playerError || !player) throw new Error("Player not found.");
    if (player.income < cost) {
      return res.status(400).json({ error: "Not enough income." });
    }

    // Deduct the cost from the player's income
    const { error: incomeUpdateError } = await supabase
      .from("Players")
      .update({ income: player.income - cost })
      .eq("playerID", playerID);

    if (incomeUpdateError) throw new Error("Failed to update player income.");

    // Increment the ingredient quantity in the inventory
    const { data: existingInventory, error: inventoryFetchError } = await supabase
      .from("Inventory")
      .select("quantity")
      .eq("playerID", playerID)
      .eq("ingredient", ingredient)
      .single();

    if (inventoryFetchError) throw new Error("Failed to fetch inventory.");

    const newQuantity = (existingInventory?.quantity || 0) + 1;

    const { error: inventoryUpdateError } = await supabase
      .from("Inventory")
      .upsert({ playerID, ingredient, quantity: newQuantity }, { onConflict: ["playerID", "ingredient"] });

    if (inventoryUpdateError) throw new Error("Failed to update inventory.");

    // Fetch updated inventory
    const { data: updatedInventory, error: updatedInventoryFetchError } = await supabase
      .from("Inventory")
      .select("*")
      .eq("playerID", playerID);

    if (updatedInventoryFetchError) throw new Error("Failed to fetch updated inventory.");

    res.status(200).json(updatedInventory);
  } catch (error) {
    console.error("Error in /buy endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
