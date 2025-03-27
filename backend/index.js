const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
