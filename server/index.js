import express from "express";
import http from "http";
import cors from "cors";
import { setupSocket } from "./src/network/socket.js"; 

const app = express();
app.use(cors());
app.use(express.json());

// optional health check for sanity
// app.get("/health", (req, res) => {
//   res.json({ status: "ok" });
// });

const server = http.createServer(app);

// Attach socket logic
setupSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
