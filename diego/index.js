const express = require("express");
const helmet = require("helmet");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3001;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// Body parsing middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Cookie parser for CSRF protection
app.use(cookieParser());

// CSRF protection (exclude Swagger docs)
app.use((req, res, next) => {
  if (req.path.startsWith("/api-docs")) {
    return next();
  }
  csrf({ cookie: true })(req, res, next);
});

// Import routes
const actionsRoutes = require("./routes/actions");

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Diego API - Service de Filtres",
      version: "1.0.0",
      description: "API pour le traitement de filtres d'images",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Serveur de développement",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use routes
app.use("/api/v1", actionsRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "Diego",
    description: "Service de traitement de filtres d'images",
    version: "1.0.0",
    endpoints: {
      docs: "/api-docs",
      actions: "POST /api/v1/actions",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur Diego démarré sur le port ${port}`);
  console.log(
    `📚 Documentation disponible sur http://localhost:${port}/api-docs`
  );
});
