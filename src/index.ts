import 'dotenv/config'
import express from "express";
import { env } from "./config/env";
import sessionMiddleware from "./middleware/session.middleware";
import cors from 'cors';
import path from 'node:path';



import authRoutes from "./routes/auth.routes";
import discoveryRoutes from "./routes/discovery.routes";
import authorizeRoutes from "./routes/authorize.routes";
import tokenRoutes from "./routes/token.routes";
import jwksRoutes from "./routes/jwks.routes";
import userinfoRoutes from "./routes/userinfo.routes";
import clientRoutes from './routes/client.routes';

const app = express();
app.set("trust proxy", 1);
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(express.static(path.resolve("public")));


app.use("/clients", clientRoutes);
app.use("/.well-known", discoveryRoutes);
app.use("/auth", authRoutes);
app.use("/oauth2", authorizeRoutes);
app.use("/validation", tokenRoutes);
app.use("/public", jwksRoutes);
app.use("/info", userinfoRoutes);


app.listen(env.port, () => {
  console.log(`Server running on ${env.issuerUrl}`);
});

