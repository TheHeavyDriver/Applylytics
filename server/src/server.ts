import express from "express";
import applicationRoutes from "./routes/applicationRoutes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/applications", applicationRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Server running");
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});