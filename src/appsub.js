// Librarys
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import path from "path";
import { fileURLToPath } from "url";
// DB Connection
import { connectDB } from "./DB/index.js";
// Routes
import { AuthRouters } from "./Router/AuthRouters.js";

// Response Handler
import { AdminRouters } from "./Router/AdminRouters.js";
import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";

export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export let app = express();

const API_PreFix = "/api/v1";


app.use("/", express.static("Uploads"));

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
// Configure body-parser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});
// Connect To Database
connectDB();
// Running Seeder
// RunSeeder();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});
// Routes
app.use(API_PreFix, AuthRouters);
// ====// Bussiness Routes


// Route For  Business and Worker
app.use(API_PreFix, AdminRouters);

app.use(ResHandler);
