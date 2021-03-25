import { readdirSync } from "fs";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
const morgan = require("morgan");
require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB connection error", err));

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"))
  );
}

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
