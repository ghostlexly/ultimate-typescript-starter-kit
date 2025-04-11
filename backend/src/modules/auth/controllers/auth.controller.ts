import { prisma } from "@/common/database/prisma";
import { HttpException } from "@/common/exceptions/http-exception";
import { authService } from "@/common/services/auth.service";
import { validateData } from "@/common/utils/validation";
import { Admin, Customer } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import {
  authRefreshTokenValidator,
  authSigninValidator,
} from "../validators/auth.validators";

export class AuthController {
  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = await validateData(authSigninValidator, {
        body: req.body,
      });

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
      const validPassword = await authService.comparePassword({
        password: body.password,
        hashedPassword: user.password,
      });

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
      const { body } = await validateData(authRefreshTokenValidator, {
        body: req.body,
      });

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
