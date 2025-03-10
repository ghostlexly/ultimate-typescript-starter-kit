import request from "supertest";
import { bootstrap } from "@/app";
import { Express } from "express";
import { prisma } from "@/common/database/prisma";
import { initializeTestDb } from "@/common/test/jest-initialize-db";

let app: Express;

beforeAll(async () => {
  await initializeTestDb();

  app = await bootstrap();
});

describe("AuthController", () => {
  describe("POST /api/auth/signin", () => {
    it("returns a status code 200 if the signin is successful as admin", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .set("x-throttler-test-mode", "true")
        .send({
          email: "contact@lunisoft.fr",
          password: "password",
          role: "ADMIN",
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it("returns a status code 400 if the password is incorrect", async () => {
      const response = await request(app)
        .post("/api/auth/signin")
        .set("x-throttler-test-mode", "true")
        .send({
          email: "contact@lunisoft.fr",
          password: "wrong-password",
          role: "ADMIN",
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Invalid credentials.",
      });
    });

    it("returns a status code 429 if i tried more than 10 times to signin", async () => {
      for (let i = 0; i < 10; i++) {
        await request(app).post("/api/auth/signin").send({
          email: "contact@lunisoft.fr",
          password: "password",
          role: "ADMIN",
        });
      }

      const response = await request(app).post("/api/auth/signin").send({
        email: "contact@lunisoft.fr",
        password: "password",
        role: "ADMIN",
      });

      expect(response.status).toEqual(429);
      expect(response.body).toEqual({
        message: "Too many requests, please try again later.",
      });
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("returns a status code 200 if the refresh token was found", async () => {
      // Create a session
      const session = await prisma.session.create({
        data: {
          refreshToken: "test-refresh-token",
          accountId: "f494c2f4-d257-4739-80e8-797f2f23d17c", // contact@lunisoft.fr
        },
      });

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("x-throttler-test-mode", "true")
        .send({
          refreshToken: session.refreshToken,
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
      });
    });

    it("returns a status code 400 if the refresh token was not found", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .set("x-throttler-test-mode", "true")
        .send({
          refreshToken: "invalid-refresh-token",
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Invalid or expired refresh token.",
      });
    });

    it("returns a status code 429 if i tried more than 10 times to refresh", async () => {
      for (let i = 0; i < 10; i++) {
        await request(app).post("/api/auth/refresh").send({
          refreshToken: "test-refresh-token",
        });
      }

      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: "test-refresh-token",
      });

      expect(response.status).toEqual(429);
      expect(response.body).toEqual({
        message: "Too many requests, please try again later.",
      });
    });
  });
});
