const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");

router.post("/:playerID/makePizza", async (req, res) => {
  const { playerID } = req.params;
  const { pizzasToMake, toppings } = req.body; // toppings is optional

  if (!pizzasToMake || pizzasToMake <= 0) {
    return res.status(400).json({ error: "Invalid number of pizzas to make." });
  }

  try {
    // Fetch inventory and ingredient types
    const { data: inventory, error: inventoryError } = await supabase
      .from("Inventory")
      .select(`
        ingredient,
        quantity,
        Ingredients (type)
      `)
      .eq("playerID", playerID);

    if (inventoryError || !inventory) {
      return res.status(404).json({ error: "Inventory not found." });
    }

    // Filter base ingredients
    const baseIngredients = inventory.filter(
      (item) => item.Ingredients.type === "base"
    );

    // Check availability of base ingredients
    const flour = baseIngredients.find((item) => item.ingredient === "flour")?.quantity || 0;
    const tomatoSauce = baseIngredients.find((item) => item.ingredient === "tomato sauce")?.quantity || 0;
    const cheese = baseIngredients.find((item) => item.ingredient === "cheese")?.quantity || 0;

    const maxPizzas = Math.min(flour, tomatoSauce, cheese);

    if (pizzasToMake > maxPizzas) {
      return res.status(400).json({
        error: `Not enough base ingredients. You can make up to ${maxPizzas} pizzas.`,
      });
    }

    // Deduct base ingredients
    const updates = [
      { ingredient: "flour", quantity: flour - pizzasToMake },
      { ingredient: "tomato sauce", quantity: tomatoSauce - pizzasToMake },
      { ingredient: "cheese", quantity: cheese - pizzasToMake },
    ];

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("Inventory")
        .update({ quantity: update.quantity })
        .eq("playerID", playerID)
        .eq("ingredient", update.ingredient);

      if (updateError) {
        throw new Error(`Failed to update ${update.ingredient}.`);
      }
    }

    // Add pizzas to the Pizzas table
    const pizzas = Array.from({ length: pizzasToMake }, () => ({
      playerID,
      toppings: toppings || null, // Optional toppings
    }));

    const { error: pizzaInsertError } = await supabase
      .from("Pizzas")
      .insert(pizzas);

    if (pizzaInsertError) {
      throw new Error("Failed to add pizzas.");
    }

    res.status(200).json({ message: `${pizzasToMake} pizzas made successfully!` });
  } catch (error) {
    console.error("Error in /makePizza endpoint:", error.message);
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;