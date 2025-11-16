import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoutes } from "./modules/users/users.routes";
import { buildContainer } from "./utils/buildContainer";
import { volunteersRoutes } from "./modules/volunteers/volunteers.routes";
import { AssociationsRouter } from "./modules/associations/associations.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { handleError } from "./middlewares/handleError";
import { inviationRoutes } from "./modules/invitations/invitation.routes";
import { missionsRoutes } from "./modules/missions/missions.routes";
import { applicationRoutes } from "./modules/applications/applications.routes";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: process.env.URL_FRONT, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const container = buildContainer();
const userController = container.userController;
const volunteersController = container.volunteersController;
const associationsController = container.associationsController;
const authController = container.authController;
const invitationsController = container.invitationsController;
const missionsController = container.missionsController;
const applicationsController = container.applicationsController;

app.use("/auth", authRoutes(authController));
app.use("/users", userRoutes(userController));
app.use("/volunteers", volunteersRoutes(volunteersController));
app.use("/associations", AssociationsRouter(associationsController));
app.use("/invitations", inviationRoutes(invitationsController));
app.use("/missions", missionsRoutes(missionsController));
app.use("/applications", applicationRoutes(applicationsController));

app.use(handleError);

app.listen(PORT, () => console.log("Locahost connected", PORT));
