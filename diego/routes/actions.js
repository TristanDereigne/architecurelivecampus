const express = require("express");
const imageService = require("../services/imageService");

const router = express.Router();

/**
 * @swagger
 * /api/v1/actions:
 *   post:
 *     summary: Appliquer un filtre à une image
 *     description: Traite une image avec un filtre spécifique (Sepia, etc.)
 *     tags: [Filtres]
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
 *                   - filter_name
 *                 properties:
 *                   Image:
 *                     type: string
 *                     format: base64
 *                     description: Image encodée en base64
 *                     example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA,"
 *                   transformation:
 *                     type: string
 *                     enum: [filter]
 *                     example: "filter"
 *                   type_id:
 *                     type: string
 *                     example: "3"
 *                   filter_name:
 *                     type: string
 *                     example: "Sepia"
 *     responses:
 *       200:
 *         description: Filtre appliqué avec succès
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
router.post("/actions", (req, res) => {
  try {
    // Process the request using the service
    const result = imageService.processFilterRequest(req.body);
    console.log("result : ", result);

    const { metadata, data } = result;
    const { Image } = data;

    // Return the response with appropriate status code
    res.status(result.statusCode).json({
      metadata: req.body.metadata || {},
      data: result.data,
    });

    setTimeout(() => {
      fetch("http://localhost:3000/api/v1/actions/diego", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata,
          data: {
            success: true,
            image: Image,
          },
        }),
      })
        // .then((response) => response.json())
        .then((data) => {
          // console.log("data : ", data);
          console.log("DONNES RECU DE bill : ");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }, 1000);
  } catch (error) {
    console.error("Error processing filter request:", error);
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

module.exports = router;
