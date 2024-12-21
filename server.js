const express = require("express");
const cors = require("cors");
const playersRoutes = require("./routes/players");
const inventoryRoutes = require("./routes/inventory");
const cookRoutes = require("./routes/cook");
const pizzasRoutes = require("./routes/pizzas");
require("dotenv").config();

const app = express();
// Enable CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://pizzaempire.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`CORS request from origin: ${origin}`); // Debugging
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies or auth headers if needed
  })
);

app.options("*", cors());

app.use(express.json());

// Routes
app.use("/players", playersRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/cook", cookRoutes);
app.use("/pizzas", pizzasRoutes);

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
