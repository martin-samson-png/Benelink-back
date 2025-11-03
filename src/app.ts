import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoutes } from "./routes/users.routes";
import { buildContainer } from "./utils/buildContainer";
import { volunteersRoutes } from "./routes/volunteers.routes";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: process.env.URL_FRONT, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const container = buildContainer();
const userController = container.userController;
const volunteersController = container.volunteersController;

app.use("/users", userRoutes(userController));
app.use("/volunteers", volunteersRoutes(volunteersController));

app.listen(PORT, () => console.log("Locahost connected", PORT));
