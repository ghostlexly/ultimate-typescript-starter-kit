import { strictThrottler } from "@/common/throttlers/strict.throttler";
import { Router } from "express";
import { authController } from "../controllers/auth.controller";

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
 *                refreshToken:
 *                  type: string
 *      '400':
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *      '401':
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */

authRoutes.post("/auth/signin", strictThrottler, authController.signIn);

/**
 * @swagger
 * /api/auth/refresh:
 *  post:
 *    summary: Refresh access token by giving a refresh token
 *    description: Refresh access token by giving a refresh token
 *    tags:
 *      - Auth
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              refreshToken:
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
authRoutes.post("/auth/refresh", strictThrottler, authController.refreshToken);
