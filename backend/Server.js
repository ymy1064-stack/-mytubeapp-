const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const seoRoutes = require("./routes/seo");
const thumbnailRoutes = require("./routes/thumbnail");
const youtubeRoutes = require("./routes/youtube");

app.use("/api/seo", seoRoutes);
app.use("/api/thumbnail", thumbnailRoutes);
app.use("/api/youtube", youtubeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
