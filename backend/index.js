const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
