import { NextFunction, Request, Response } from "express";
import { prisma } from "#/infrastructure/database/prisma";
import bcrypt from "bcrypt";
import { HttpException } from "#/shared/exceptions/http-exception";
import { AuthSigninValidator } from "../validators/auth.validators";
import { Customer } from "@prisma/client";
import { Admin } from "@prisma/client";
import { authService } from "#/shared/services/auth.service";

export class AuthController {
  onSignIn = async (req: Request, res: Response, next: NextFunction) => {
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
        throw new HttpException({
          status: 401,
          message: "Invalid credentials.",
        });
      }

      if (!user.password) {
        throw new HttpException({
          status: 401,
          message:
            "You have previously signed up with another service like Google, please use the appropriate login method for this account.",
        });
      }

      // Hash given password and compare it to the stored hash
      const validPassword = await bcrypt.compare(body.password, user.password);

      if (!validPassword) {
        throw new HttpException({
          status: 401,
          message: "Invalid credentials.",
        });
      }

      const accessToken = await authService.generateJwtToken({
        accountId: user.accountId,
      });

      return res.json({
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  onRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = req.context?.account;

      if (!account) {
        throw HttpException.badRequest({
          message: "Unauthorized.",
        });
      }

      const accessToken = await authService.generateJwtToken({
        accountId: account.id,
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
