import { NextFunction, Request, Response } from "express";
import { HttpException } from "@/common/errors/http-exception";

export class MeController {
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = req.context?.account;

      if (account?.role === "CUSTOMER") {
        return res.json({
          id: account.customer.id,
          email: account.customer.email,
          role: account.role,
        });
      } else if (account?.role === "ADMIN") {
        return res.json({
          id: account.admin.id,
          email: account.admin.email,
          role: account.role,
        });
      } else {
        throw new HttpException({
          status: 400,
          message: "Invalid role.",
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

export const meController = new MeController();
