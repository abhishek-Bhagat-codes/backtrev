/**
 * Travira Monitoring Engine - Server Entry Point
 */

require("./config/db"); // Initialize DB and tables

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running", PORT);
});
