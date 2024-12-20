const express = require("express");
const cors = require("cors");
const playersRoutes = require("./routes/players");
const inventoryRoutes = require("./routes/inventory");
require("dotenv").config();

const app = express();
// Enable CORS
const allowedOrigins = [
  "http://localhost:3000", 
  "https://pizzaempire.netlify.app/", 
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


app.use(express.json());

// Routes
app.use("/players", playersRoutes);
app.use("/inventory", inventoryRoutes);

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
