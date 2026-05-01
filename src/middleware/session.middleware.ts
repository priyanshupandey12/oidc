import session from "express-session";
import connectPg from "connect-pg-simple";

const PgStore = connectPg(session);

export default (session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
     tableName: "session",
      pruneSessionInterval: 60 * 15,
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 
  }
}));