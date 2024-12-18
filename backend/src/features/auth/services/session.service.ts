import { HttpException } from "#/common/errors/http-exception";
import { prisma } from "#/common/providers/database/prisma";
import { Prisma } from "@prisma/client";
import { add, isAfter } from "date-fns";

export class SessionService {
  create = async ({ accountId }: { accountId: string }) => {
    const session = await prisma.session.create({
      data: {
        expiresAt: add(new Date(), { days: 7 }),
        token: crypto.randomUUID(),
        accountId: accountId,
      },
    });

    return session;
  };

  remove = async ({ where }: { where: Prisma.SessionWhereUniqueInput }) => {
    await prisma.session.delete({
      where,
    });
  };

  findByToken = async ({ token }: { token: string }) => {
    const session = await prisma.session.findUnique({
      include: {
        account: {
          include: {
            admin: true,
            customer: true,
          },
        },
      },
      where: {
        token: token,
      },
    });

    if (!session) {
      throw new HttpException({
        status: 403,
        message: `Session #${token} not found.`,
      });
    }

    return session;
  };

  isExpired = async ({ token }: { token: string }) => {
    const session = await prisma.session.findFirst({
      where: {
        token: token,
      },
    });

    if (!session) {
      return false;
    }

    if (isAfter(new Date(), session.expiresAt)) {
      await this.remove({
        where: {
          id: session.id,
        },
      });

      return true;
    }

    return false;
  };

  /**
   * Generate a JWT token for a given user id.
   */
  // generateJwtToken = async ({
  //   userId,
  // }: {
  //   userId: string;
  // }): Promise<string> => {
  // -- Get the user
  //   const user = await User.findByPk(userId);

  //   if (!user) {
  //     throw new Error("User not found.");
  //   }

  //   // -- Generate the JWT token
  //   return await jwt.sign(
  //     {
  //       sub: userId,
  //       role: user.role,
  //     },
  //     APP_JWT_SECRET,
  //     {
  //       expiresIn: `1h`,
  //     }
  //   );
  // };
}

export const sessionService = new SessionService();
