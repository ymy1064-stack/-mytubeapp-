import express from "express";
import { analyzeSEO } from "../services/gemini.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { title, description, tags } = req.body;
  const result = await analyzeSEO(title, description, tags);
  res.json(result);
});

export default router;
