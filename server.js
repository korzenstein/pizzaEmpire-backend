const express = require("express");
const cors = require("cors");
const playersRoutes = require("./routes/players");
const inventoryRoutes = require("./routes/inventory");
require("dotenv").config();

const app = express();
// Enable CORS
app.use(cors({
  origin: "http://localhost:3000", 
}));

app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/players", playersRoutes);
app.use("/inventory", inventoryRoutes);

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
