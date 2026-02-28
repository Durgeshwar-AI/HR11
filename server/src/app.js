import express from "express";
import helmet from "helmet";
import cors from "cors";

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the HR11! Hello");
});

app.get("/hello", (req, res) => {
  res.send("Welcome to the HR11! Hello");
});

export default app;