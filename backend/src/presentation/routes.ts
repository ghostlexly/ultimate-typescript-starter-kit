import { Router } from "express";
import { meRoutes } from "#/modules/me/routes/me.routes";
import { testRoutes } from "#/modules/test/routes/test.routes";
import { mediaRoutes } from "#/modules/media/routes/media.routes";
import { authRoutes } from "#/modules/auth/routes/auth.routes";

export const apiRouter = Router();
// -- Common
apiRouter.use(mediaRoutes);

// -- Auth
apiRouter.use(meRoutes);
apiRouter.use(authRoutes);

// -- Business
apiRouter.use(testRoutes);
