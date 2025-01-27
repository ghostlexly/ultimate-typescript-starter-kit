import { NextFunction, Request, Response } from "express";
import { prisma } from "#/infrastructure/database/prisma";
import bcrypt from "bcrypt";
import { HttpException } from "#/shared/exceptions/http-exception";
import {
  AuthRefreshTokenValidator,
  AuthSigninValidator,
} from "../validators/auth.validators";
import { Customer } from "@prisma/client";
import { Admin } from "@prisma/client";
import { authService } from "#/shared/services/auth.service";
import { randomUUID } from "crypto";

export class AuthController {
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as AuthSigninValidator["body"];

      // Verify if user exists
      let user: Admin | Customer | null = null;
      if (body.role === "ADMIN") {
        user = await prisma.admin.findFirst({
          where: {
            email: body.email,
          },
        });
      } else if (body.role === "CUSTOMER") {
        user = await prisma.customer.findFirst({
          where: {
            email: body.email,
          },
        });
      }

      if (!user) {
        throw HttpException.badRequest({
          message: "Invalid credentials.",
        });
      }

      if (!user.password) {
        throw HttpException.badRequest({
          message:
            "You have previously signed up with another service like Google, please use the appropriate login method for this account.",
        });
      }

      // Hash given password and compare it to the stored hash
      const validPassword = await bcrypt.compare(body.password, user.password);

      if (!validPassword) {
        throw HttpException.badRequest({
          message: "Invalid credentials.",
        });
      }

      const accessToken = await authService.generateAccessToken({
        accountId: user.accountId,
      });

      const refreshToken = randomUUID();
      await prisma.session.create({
        data: {
          accountId: user.accountId,
          refreshToken: refreshToken,
        },
      });

      return res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as AuthRefreshTokenValidator["body"];

      const session = await prisma.session.findFirst({
        where: {
          refreshToken: body.refreshToken,
        },
      });

      if (!session) {
        throw HttpException.badRequest({
          message: "Invalid or expired refresh token.",
        });
      }

      const accessToken = await authService.generateAccessToken({
        accountId: session.accountId,
      });

      return res.json({
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
