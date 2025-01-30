const express = require('express');
const { loginUser } = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: El correo electrónico del usuario
 *         password:
 *           type: string
 *           description: La contraseña del usuario
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para la gestión de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Token JWT y ID del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *                 userId:
 *                   type: string
 *                   description: ID del usuario autenticado
 *       400:
 *         description: Correo electrónico o contraseña inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/login', loginUser);

module.exports = router;
