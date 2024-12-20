const express = require("express");
const cors = require("cors");
const playersRoutes = require("./routes/players");
const inventoryRoutes = require("./routes/inventory");
require("dotenv").config();

const app = express();
// Enable CORS
const allowedOrigins = [
  "http://localhost:3000", 
  process.env.FRONTEND_URL, 
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
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
