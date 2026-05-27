import { pgTable, uuid, text, timestamp, boolean, json, index } from "drizzle-orm/pg-core";

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
}, (table) => {
  return {
    expireIdx: index("IDX_session_expire").on(table.expire),
  };
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // WHY uuid: integer IDs are predictable (user?id=1, user?id=2)
  // uuid se enumeration attacks nahi hote

  email: text("email").notNull().unique(),
  // WHY unique: ek email = ek account, duplicate login prevent karta hai

  passwordHash: text("password_hash").notNull(),
  // WHY hash: kabhi bhi plain password store mat karo
  // WHEN: register pe bcrypt/argon2 se hash karke store karo

  name: text("name").notNull(),

  profileImageUrl: text("profile_image_url"),
  // WHY nullable: optional hai, ID token mein "picture" claim ban jaayega

  emailVerifiedAt: timestamp("email_verified_at"),
  // WHY nullable: verification ke baad set hoga
  // WHEN: agar null hai toh login block karo ya warning do

  isActive: boolean("is_active").notNull().default(true),
  // WHY: soft delete / ban feature ke liye
  // WHEN: false hai toh token issue mat karo

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  // WHY: yahi "client_id" banega jo third-party apps use karenge

  secret: text("secret").notNull(),
  // WHY: client ki identity verify karne ke liye /token endpoint pe
  // HOW: bcrypt se hash karke store karo, plain mat rakhna
  // WHEN: client credentials grant mein verify hoga

  name: text("name").notNull(),
  // WHY: consent screen pe dikhega — "XYZ App wants access to..."

  redirectUris: text("redirect_uris").array().notNull(),
  // WHY: SECURITY — sirf yahi URIs allowed hain redirect ke liye
  // HOW: array kyunki ek client ke multiple URIs ho sakte hain
  // WHEN: auth request pe redirect_uri validate karoge iske against

  allowedScopes: text("allowed_scopes").array().notNull(),
  // WHY: client sirf yahi scopes request kar sakta hai
  // WHEN: auth request pe check karo ki requested scopes subset hain ya nahi

  isActive: boolean("is_active").notNull().default(true),
  // WHY: client ko revoke karna ho toh bina delete ke band kar sako

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const authorizationCodes = pgTable("authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),

  code: text("code").notNull().unique(),
  // WHY: yahi woh random string hai jo client ko redirect mein milti hai
  // HOW: crypto.randomBytes(32).toString('hex') — always cryptographically random
  // WHEN: user login kare aur consent de, tabhi generate karo

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // WHY: token exchange pe pata chalega ki code kis user ke liye tha

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  // WHY: verify karna hai ki same client exchange kar raha hai jo request kiya tha

  redirectUri: text("redirect_uri").notNull(),
  // WHY CRITICAL: /token pe client jo redirect_uri bheje,
  // woh exactly match honi chahiye isse — OAuth spec requirement hai
  // bina iske code injection attacks ho sakte hain

  scopes: text("scopes").array().notNull(),
  // WHY: yeh scopes user ne approve kiye, inhi ke liye token banega

  expiresAt: timestamp("expires_at").notNull(),
  // WHY: auth codes max 10 minutes valid hote hain (spec)
  // WHEN: exchange pe check karo — expire ho gaya toh reject

  usedAt: timestamp("used_at"),
  // WHY SECURITY: code single-use hota hai
  // WHEN: agar usedAt already set hai aur phir same code aaya
  // toh yeh replay attack hai — sab tokens us client ke revoke karo

  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),

  token: text("token").notNull().unique(),
  // WHY: yahi woh value hai jo client store karta hai
  // HOW: crypto.randomBytes(64).toString('hex') — access token se lamba
  // kyunki yeh long-lived hai, zyada entropy chahiye

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  scopes: text("scopes").array().notNull(),
  // WHY: naya access token inhi scopes ke saath banega
  // client scopes badal nahi sakta refresh ke time

  expiresAt: timestamp("expires_at").notNull(),
  // WHY: refresh tokens bhi expire hone chahiye (e.g. 30-90 days)
  // WHEN: agar expire ho gaya toh user ko wapas login karna hoga

  usedAt: timestamp("used_at"),
  // WHY: ROTATION ke liye — jab refresh token use ho,
  // iska usedAt set karo aur naya token issue karo
  // agar same token dobara aaye = refresh token theft detected!

  revokedAt: timestamp("revoked_at"),
  // WHY: explicit logout ya security breach pe set karo
  // usedAt se alag — yeh force-revoke hai, woh normal rotation hai

  createdAt: timestamp("created_at").notNull().defaultNow(),
});