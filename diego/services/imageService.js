/**
 * Service de traitement d'images pour les filtres
 * Gère la logique métier pour l'application de filtres
 */

const Joi = require('joi');

// Validation schemas
const metadataSchema = Joi.object({
  party_id: Joi.string().required(),
  task_id: Joi.string().required(),
});

const filterDataSchema = Joi.object({
  Image: Joi.string().required(),
  transformation: Joi.string().valid('filter').required(),
  type_id: Joi.string().required(),
  filter_name: Joi.string().required(),
});

const requestSchema = Joi.object({
  metadata: metadataSchema.required(),
  data: filterDataSchema.required(),
});

/**
 * Valide le format Base64 d'une image
 * @param {string} base64String - La chaîne Base64 à valider
 * @returns {boolean} - True si valide, false sinon
 */
const validateBase64 = (base64String) => {
  try {
    // Check if it's a valid base64 image format
    if (!base64String.startsWith('data:image/')) {
      return false;
    }
    
    const base64Data = base64String.split(',')[1];
    if (!base64Data) {
      return false;
    }
    
    // Validate base64 format
    const buffer = Buffer.from(base64Data, 'base64');
    return buffer.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Valide la taille d'une image Base64
 * @param {string} base64String - La chaîne Base64 à valider
 * @param {number} maxSizeMB - Taille maximale en MB (défaut: 5)
 * @returns {boolean} - True si la taille est acceptable, false sinon
 */
const validateImageSize = (base64String, maxSizeMB = 5) => {
  try {
    const base64Data = base64String.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const sizeInMB = buffer.length / (1024 * 1024);
    return sizeInMB <= maxSizeMB;
  } catch (error) {
    return false;
  }
};

/**
 * Applique un filtre à une image
 * @param {string} imageBase64 - L'image en Base64
 * @param {string} filterName - Le nom du filtre à appliquer
 * @returns {string} - L'image traitée en Base64
 */
const applyFilter = (imageBase64, filterName) => {
  // TODO: Implémenter la logique réelle d'application de filtre
  // Pour l'instant, on retourne l'image originale
  // En production, on utiliserait une bibliothèque comme Sharp ou Jimp
  
  console.log(`Applying filter: ${filterName} to image`);
  
  // Simulation du traitement
  return imageBase64;
};

/**
 * Valide une requête de traitement d'image
 * @param {Object} requestBody - Le corps de la requête
 * @returns {Object} - Résultat de la validation
 */
const validateRequest = (requestBody) => {
  return requestSchema.validate(requestBody);
};

/**
 * Traite une requête de filtre d'image
 * @param {Object} requestBody - Le corps de la requête
 * @returns {Object} - Résultat du traitement
 */
const processFilterRequest = (requestBody) => {
  try {
    // Validate request body
    const { error, value } = validateRequest(requestBody);
    if (error) {
      return {
        success: false,
        statusCode: 400,
        data: {
          success: false,
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      };
    }

    const { metadata, data } = value;

    // Check if image is provided
    if (!data.Image) {
      return {
        success: false,
        statusCode: 400,
        data: {
          success: false,
          code: 'NO_IMAGE_UPLOADED',
          message: 'No file uploaded.',
        },
      };
    }

    // Validate base64 format
    if (!validateBase64(data.Image)) {
      return {
        success: false,
        statusCode: 422,
        data: {
          success: false,
          code: 'INVALID_BASE64',
          message: 'The base64 string provided is invalid or corrupted.',
        },
      };
    }

    // Check file size
    if (!validateImageSize(data.Image)) {
      return {
        success: false,
        statusCode: 413,
        data: {
          success: false,
          code: 'PAYLOAD_TOO_LARGE',
          message: 'The file is too large. Maximum allowed size is 5MB.',
        },
      };
    }

    // Apply filter
    const processedImage = applyFilter(data.Image, data.filter_name);

    // Success response
    return {
      success: true,
      statusCode: 200,
      data: {
        success: true,
        Image: processedImage,
      },
    };

  } catch (error) {
    console.error('Error processing filter request:', error);
    return {
      success: false,
      statusCode: 500,
      data: {
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred.',
      },
    };
  }
};

module.exports = {
  validateBase64,
  validateImageSize,
  applyFilter,
  validateRequest,
  processFilterRequest,
}; 