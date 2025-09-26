// src/index.ts
import { Elysia as Elysia3 } from "elysia";

// src/controllers/auth.controller.ts
import { Elysia } from "elysia";

// src/schema/user.schema.ts
import { z } from "zod";
var loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { error: "A senha deve conter no m\xEDnimo 8 caracteres" })
});
var userSchema = z.object({
  name: z.string().min(1, {
    message: "O username deve ter pelo menos 1 caracteres"
  }),
  email: z.string().email({ message: "O email deve ser valido" }),
  password: z.string().min(8, {
    message: "A senha deve ter pelo menos 8 caracteres"
  })
}).extend({
  confirmPassword: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  message: "As senhas devem ser iguais",
  path: ["confirmPassword"]
});

// src/schema/http.schema.ts
import { z as z2 } from "zod";
var httpSchema = z2.object({
  statusCode: z2.number(),
  error: z2.string().nullable(),
  message: z2.string()
});

// src/env.ts
import { z as z3 } from "zod";
var envSchema = z3.object({
  NODE_ENV: z3.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z3.url().startsWith("postgresql://"),
  PORT: z3.coerce.number().default(3e3),
  BETTER_AUTH_SECRET: z3.string(),
  EXPIRES_IN: z3.string(),
  REFRESH_EXPIRES_IN: z3.string()
  //   SERVER_URL: z.string(),
  //   EMAIL: z.string(),
  //   GOOGLE_CLIENT_ID: z.string(),
  //   GOOGLE_CLIENT_KEY: z.string(),
  //   REFRESH_TOKEN: z.string(),
});
var env = envSchema.parse(process.env);

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";

// src/db/schema/account.schema.ts
import { pgTable as pgTable2, text as text2, timestamp as timestamp2 } from "drizzle-orm/pg-core";

// src/db/schema/users.schema.ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires")
});

// src/db/schema/account.schema.ts
var accounts = pgTable2("accounts", {
  id: text2("id").primaryKey(),
  accountId: text2("account_id").notNull(),
  providerId: text2("provider_id").notNull(),
  userId: text2("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text2("access_token"),
  refreshToken: text2("refresh_token"),
  idToken: text2("id_token"),
  accessTokenExpiresAt: timestamp2("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp2("refresh_token_expires_at"),
  scope: text2("scope"),
  password: text2("password"),
  createdAt: timestamp2("created_at").defaultNow().notNull(),
  updatedAt: timestamp2("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});

// src/db/schema/jwks.schema.ts
import { pgTable as pgTable3, text as text3, timestamp as timestamp3 } from "drizzle-orm/pg-core";
var jwkss = pgTable3("jwkss", {
  id: text3("id").primaryKey(),
  publicKey: text3("public_key").notNull(),
  privateKey: text3("private_key").notNull(),
  createdAt: timestamp3("created_at").notNull()
});

// src/db/schema/session.schema.ts
import { pgTable as pgTable4, text as text4, timestamp as timestamp4 } from "drizzle-orm/pg-core";
var sessions = pgTable4("sessions", {
  id: text4("id").primaryKey(),
  expiresAt: timestamp4("expires_at").notNull(),
  token: text4("token").notNull().unique(),
  createdAt: timestamp4("created_at").defaultNow().notNull(),
  updatedAt: timestamp4("updated_at").$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  ipAddress: text4("ip_address"),
  userAgent: text4("user_agent"),
  userId: text4("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  impersonatedBy: text4("impersonated_by")
});

// src/db/schema/verifications.schema.ts
import { pgTable as pgTable5, text as text5, timestamp as timestamp5 } from "drizzle-orm/pg-core";
var verifications = pgTable5("verifications", {
  id: text5("id").primaryKey(),
  identifier: text5("identifier").notNull(),
  value: text5("value").notNull(),
  expiresAt: timestamp5("expires_at").notNull(),
  createdAt: timestamp5("created_at").defaultNow().notNull(),
  updatedAt: timestamp5("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull()
});

// src/db/schema/index.ts
var schema = {
  users,
  sessions,
  jwkss,
  verifications,
  accounts
};

// src/db/index.ts
var db = drizzle(env.DATABASE_URL, { schema, casing: "snake_case" });

// src/controllers/auth.controller.ts
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

// src/utils/jwt.ts
import { jwtVerify, SignJWT } from "jose";
var secret = Buffer.from(env.BETTER_AUTH_SECRET, "base64");
async function sign(payload) {
  const accessToken = await new SignJWT({
    exp: Math.floor(Date.now() / 1e3) + 3600,
    ...payload,
    type: "access"
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(env.EXPIRES_IN).sign(secret);
  const refreshToken = await new SignJWT({
    exp: Math.floor(Date.now() / 1e3) + 86400,
    ...payload,
    type: "refresh"
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(env.REFRESH_EXPIRES_IN).sign(secret);
  return { refreshToken, accessToken };
}

// src/controllers/auth.controller.ts
import { z as z4 } from "zod";
var authController = new Elysia({ prefix: "/auth" }).post(
  "/token",
  async ({ body, status }) => {
    const [user] = await db.select({
      id: schema.users.id,
      email: schema.users.email,
      password: schema.accounts.password
    }).from(schema.users).innerJoin(schema.accounts, eq(schema.accounts.userId, schema.users.id)).where(eq(schema.users.email, body.email));
    if (!user) {
      return;
    }
    if (!await compare(String(user.password), body.password)) {
      return;
    }
    const data = await sign({
      sub: user.id,
      iat: Math.floor(Date.now() / 1e3)
    });
    return status(201, {
      statusCode: 201,
      error: null,
      message: "Usu\xE1rio logado com sucesso",
      data
    });
  },
  {
    body: loginSchema,
    tags: ["auth"],
    response: {
      201: httpSchema.extend({
        data: z4.object({
          accessToken: z4.jwt(),
          refreshToken: z4.jwt()
        })
      }),
      409: httpSchema,
      500: httpSchema
    }
  }
);

// src/index.ts
import { node } from "@elysiajs/node";

// src/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, jwt, openAPI } from "better-auth/plugins";
import { hash, compare as compare2 } from "bcrypt";
import { randomInt } from "crypto";
var auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  basePath: "/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    password: {
      hash: (password) => hash(password, randomInt(10, 16)),
      verify: ({ password, hash: hash2 }) => compare2(password, hash2)
    }
  },
  disabledPaths: [
    "/token"
    // desabilita o endpoint /api/auth/token (basePath + /token)
  ],
  plugins: [
    jwt({
      disableSettingJwtHeader: true
    }),
    openAPI(),
    admin()
  ]
});
var _schema;
var getSchema = async () => _schema ??= auth.api.generateOpenAPISchema();
var OpenAPI = {
  getPaths: (prefix = "/auth/api") => getSchema().then(({ paths }) => {
    const reference = /* @__PURE__ */ Object.create(null);
    for (const path of Object.keys(paths)) {
      const key = prefix + path;
      reference[key] = paths[path];
      for (const method of Object.keys(paths[path])) {
        const operation = reference[key][method];
        operation.tags = ["Better Auth"];
      }
    }
    return reference;
  }),
  components: getSchema().then(({ components }) => components)
};

// src/index.ts
import { openapi } from "@elysiajs/openapi";

// src/controllers/user.controller.ts
import { eq as eq2 } from "drizzle-orm";
import { Elysia as Elysia2 } from "elysia";
var userController = new Elysia2({ prefix: "/user" }).post(
  "",
  async ({ body, status }) => {
    const userExists = await db.select({
      id: schema.users.id,
      email: schema.users.email
    }).from(schema.users).where(eq2(schema.users.email, body.email));
    if (userExists) {
      return status(409, {
        statusCode: 500,
        error: "CONFLIT",
        message: "Usu\xE1rio j\xE1 existente"
      });
    }
    try {
      const user = await auth.api.createUser({
        body: {
          ...body,
          role: "user"
        }
      });
      return status(201, {
        statusCode: 201,
        error: null,
        message: "Usu\xE1rio criado com sucesso"
      });
    } catch (error) {
      return status(500, {
        statusCode: 500,
        error: "INTERNAL SERVER ERROR",
        message: "Erro interno no servidor"
      });
    }
  },
  {
    body: userSchema,
    response: {
      201: httpSchema,
      409: httpSchema,
      500: httpSchema
    }
  }
);

// src/index.ts
var app = new Elysia3({ prefix: "/api", adapter: node() }).use(
  openapi({
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  })
).use(authController).use(userController).mount(auth.handler).get("/", () => "Hello Elysia").listen(env.PORT);
console.log(`\u{1F98A} Elysia is running at ${"localhost"}:${env.PORT}`);
//# sourceMappingURL=index.js.map