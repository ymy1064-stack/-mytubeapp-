import express from "express";
import bodyParser from "body-parser";
import seoRoutes from "./routes/seo.js";
import thumbnailRoutes from "./routes/thumbnail.js";
import youtubeRoutes from "./routes/youtube.js";

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/api/seo", seoRoutes);
app.use("/api/thumbnail", thumbnailRoutes);
app.use("/api/youtube", youtubeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
