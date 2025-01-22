import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";

export const initializeTestDb = async () => {
  await cleanupTestDb();

  await seedTestDb();
};

const cleanupTestDb = async () => {
  // Customer
  await prisma.customer.deleteMany();

  // Admin
  await prisma.admin.deleteMany();
};

const seedTestDb = async () => {
  const hashedPassword = await bcrypt.hash("password", 10);

  await prisma.admin.create({
    data: {
      email: "contact@lunisoft.fr",
      password: hashedPassword,
      account: {
        create: {
          role: "ADMIN",
        },
      },
    },
  });
};
