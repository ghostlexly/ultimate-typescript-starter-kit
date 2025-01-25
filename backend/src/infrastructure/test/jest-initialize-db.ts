import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";

export const initializeTestDb = async () => {
  await cleanupTestDb();

  await seedTestDb();
};

const cleanupTestDb = async () => {
  // Session
  await prisma.session.deleteMany();

  // Customer
  await prisma.customer.deleteMany();

  // Admin
  await prisma.admin.deleteMany();

  // Account
  await prisma.account.deleteMany();
};

const seedTestDb = async () => {
  const hashedPassword = await bcrypt.hash("password", 10);

  await prisma.admin.create({
    data: {
      id: "03f76f80-30ee-4db5-a542-de207d8ac7c5",
      email: "contact@lunisoft.fr",
      password: hashedPassword,
      account: {
        create: {
          id: "f494c2f4-d257-4739-80e8-797f2f23d17c",
          role: "ADMIN",
        },
      },
    },
  });
};
