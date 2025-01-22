import { strictThrottler } from "#/presentation/throttlers/strict.throttler";
import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "#/presentation/middlewares/validation.middleware";
import { authSigninValidator } from "../validators/auth.validator";

export const authRoutes = Router();

/**
 * @swagger
 * /api/auth/signin:
 *  post:
 *    summary: Sign in
 *    description: Sign in as admin or customer
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *              role:
 *                type: string
 *    responses:
 *      '200':
 *        description: OK
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 */
authRoutes.post(
  "/auth/signin",
  strictThrottler,
  validateRequest(authSigninValidator),
  authController.onSignIn
);
