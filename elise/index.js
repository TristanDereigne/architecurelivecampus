const express = require("express");
const helmet = require("helmet");
const Joi = require("joi");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3002;

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

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Elise API - Service d'Effets",
      version: "1.0.0",
      description: "API pour le traitement d'effets d'images",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Serveur de développement",
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Validation schemas
const metadataSchema = Joi.object({
  party_id: Joi.string().required(),
  task_id: Joi.string().required(),
});

const effectDataSchema = Joi.object({
  Image: Joi.string().required(),
  transformation: Joi.string().valid("effect").required(),
  type_id: Joi.string().required(),
  direction: Joi.string().valid("horizontal", "vertical").required(),
});

const requestSchema = Joi.object({
  metadata: metadataSchema.required(),
  data: effectDataSchema.required(),
});

// Utility functions
const validateBase64 = (base64String) => {
  try {
    // Check if it's a valid base64 image format
    if (!base64String.startsWith("data:image/")) {
      return false;
    }

    const base64Data = base64String.split(",")[1];
    if (!base64Data) {
      return false;
    }

    // Validate base64 format
    const buffer = Buffer.from(base64Data, "base64");
    return buffer.length > 0;
  } catch (error) {
    return false;
  }
};

const validateImageSize = (base64String) => {
  try {
    const base64Data = base64String.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const sizeInMB = buffer.length / (1024 * 1024);
    return sizeInMB <= 5; // 5MB limit
  } catch (error) {
    return false;
  }
};

/**
 * @swagger
 * /api/v1/actions:
 *   post:
 *     summary: Appliquer un effet à une image
 *     description: Traite une image avec un effet spécifique (horizontal/vertical)
 *     tags: [Effets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metadata
 *               - data
 *             properties:
 *               metadata:
 *                 type: object
 *                 required:
 *                   - party_id
 *                   - task_id
 *                 properties:
 *                   party_id:
 *                     type: string
 *                     example: "154247"
 *                   task_id:
 *                     type: string
 *                     example: "45659"
 *               data:
 *                 type: object
 *                 required:
 *                   - Image
 *                   - transformation
 *                   - type_id
 *                   - direction
 *                 properties:
 *                   Image:
 *                     type: string
 *                     format: base64
 *                     description: Image encodée en base64
 *                     example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA,"
 *                   transformation:
 *                     type: string
 *                     enum: [effect]
 *                     example: "effect"
 *                   type_id:
 *                     type: string
 *                     example: "3"
 *                   direction:
 *                     type: string
 *                     enum: [horizontal, vertical]
 *                     example: "horizontal"
 *     responses:
 *       200:
 *         description: Effet appliqué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     Image:
 *                       type: string
 *                       format: base64
 *       400:
 *         description: Aucune image fournie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     code:
 *                       type: string
 *                       example: "NO_IMAGE_UPLOADED"
 *                     message:
 *                       type: string
 *                       example: "No file uploaded."
 *       413:
 *         description: Fichier trop volumineux
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     code:
 *                       type: string
 *                       example: "PAYLOAD_TOO_LARGE"
 *                     message:
 *                       type: string
 *                       example: "The file is too large. Maximum allowed size is 5MB."
 *       422:
 *         description: Base64 invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     code:
 *                       type: string
 *                       example: "INVALID_BASE64"
 *                     message:
 *                       type: string
 *                       example: "The base64 string provided is invalid or corrupted."
 */
app.post("/api/v1/actions", (req, res) => {
  try {
    // Validate request body
    const { error, value } = requestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        metadata: req.body.metadata || {},
        data: {
          success: false,
          code: "VALIDATION_ERROR",
          message: error.details[0].message,
        },
      });
    }

    const { metadata, data } = value;

    // Check if image is provided
    if (!data.Image) {
      return res.status(400).json({
        metadata,
        data: {
          success: false,
          code: "NO_IMAGE_UPLOADED",
          message: "No file uploaded.",
        },
      });
    }

    // Validate base64 format
    if (!validateBase64(data.Image)) {
      return res.status(422).json({
        metadata,
        data: {
          success: false,
          code: "INVALID_BASE64",
          message: "The base64 string provided is invalid or corrupted.",
        },
      });
    }

    // Check file size
    if (!validateImageSize(data.Image)) {
      return res.status(413).json({
        metadata,
        data: {
          success: false,
          code: "PAYLOAD_TOO_LARGE",
          message: "The file is too large. Maximum allowed size is 5MB.",
        },
      });
    }

    // Simulate effect processing (in real implementation, apply actual effect)
    // For now, we'll return the same image with success status
    const processedImage = data.Image; // In real implementation, apply effect here

    // Success response
    res.status(200).json({
      metadata,
      data: {
        success: true,
        Image: processedImage,
      },
    });
  } catch (error) {
    console.error("Error processing effect request:", error);
    res.status(500).json({
      metadata: req.body.metadata || {},
      data: {
        success: false,
        code: "INTERNAL_ERROR",
        message: "An internal server error occurred.",
      },
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    service: "Elise",
    description: "Service de traitement d'effets d'images",
    version: "1.0.0",
    endpoints: {
      docs: "/api-docs",
      actions: "POST /api/v1/actions",
    },
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur Elise démarré sur le port ${port}`);
  console.log(
    `📚 Documentation disponible sur http://localhost:${port}/api-docs`
  );
});
