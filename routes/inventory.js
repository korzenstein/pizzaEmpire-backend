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

// Fetch inventory for a specific player
router.get("/:playerID", async (req, res) => {
  const { playerID } = req.params;

  try {
    // Join Inventory with Ingredients to include the cost of each ingredient
    const { data, error } = await supabase
      .from("Inventory")
      .select(`
        ingredient,
        quantity,
        Ingredients (cost)
      `)
      .eq("playerID", playerID);

    if (error) throw error;

    // Format the response to include the cost alongside each inventory item
    const formattedData = data.map((item) => ({
      ingredient: item.ingredient,
      quantity: item.quantity,
      cost: item.Ingredients.cost,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in GET /inventory/:playerID:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Buy an ingredient for a player
router.post("/:playerID/buy", async (req, res) => {
  const { playerID } = req.params;
  const { ingredient } = req.body;

  if (!ingredient) {
    return res.status(400).json({ error: "Ingredient is required." });
  }

  try {
    // Fetch the cost of the ingredient
    const { data: ingredientData, error: ingredientError } = await supabase
      .from("Ingredients")
      .select("cost")
      .eq("ingredient", ingredient)
      .single();

    if (ingredientError || !ingredientData) {
      return res.status(404).json({ error: "Ingredient not found." });
    }

    const cost = ingredientData.cost;

    // Fetch the player's current income
    const { data: player, error: playerError } = await supabase
      .from("Players")
      .select("income")
      .eq("playerID", playerID)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: "Player not found." });
    }

    if (player.income < cost) {
      return res.status(400).json({ error: "Not enough income." });
    }

    // Deduct the cost from the player's income
    const { error: incomeUpdateError } = await supabase
      .from("Players")
      .update({ income: player.income - cost })
      .eq("playerID", playerID);

    if (incomeUpdateError) throw new Error("Failed to update player income.");

    // Check if the ingredient already exists in the inventory
    const { data: existingInventory, error: inventoryFetchError } = await supabase
      .from("Inventory")
      .select("quantity")
      .eq("playerID", playerID)
      .eq("ingredient", ingredient)
      .single();

    if (inventoryFetchError && inventoryFetchError.message !== "Row not found") {
      throw new Error("Failed to fetch inventory.");
    }

    const newQuantity = (existingInventory?.quantity || 0) + 1;

    // Update or insert the inventory item
    const { error: inventoryUpdateError } = await supabase
      .from("Inventory")
      .upsert(
        { playerID, ingredient, quantity: newQuantity },
        { onConflict: ["playerID", "ingredient"] } // Prevent duplicate rows
      );

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
