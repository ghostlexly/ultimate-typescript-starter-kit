import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { HttpException } from "#/common/exceptions/http-exception";
import { CustomAccount } from "#/common/types/request";

/**
  Block everything if the user is not authenticated and the route is not public
  get the user from the token and add it to the request.
  Checks for JWT token in Authorization header first, then falls back to URL query params (?token=)
  @example app.get('/', (req) => req.context?.account)
*/
export const sessionsGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract Authorization header
  const authHeader = req.headers.authorization;

  // If the authorization header is not present, try to get the token from the url query params
  if (!authHeader) {
    const token = req.query?.["token"];
    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }
  }

  // Call passport authentication mechanism
  await passport.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: CustomAccount) => {
      // Handle middleware error
      if (err) {
        return next(err);
      }

      // Handle authentication failure
      // We provide 401 status code so the frontend can redirect to the login page
      if (!user) {
        return next(
          new HttpException({
            status: 401,
            message:
              "Authentication required. Please provide a valid access token.",
          })
        );
      }

      // Handle authentication success
      req.context = {
        account: user,
      };
      next();
    }
  )(req, res, next);
};
