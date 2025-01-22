import request from "supertest";
import { bootstrap } from "#/app";
import { Express } from "express";

let app: Express;

beforeAll(async () => {
  app = await bootstrap();
});

describe("AuthController", () => {
  describe("POST /api/auth/signin", () => {
    it("returns a status code 200 if the signin is successful as admin", async () => {
      const response = await request(app).post("/api/auth/signin").send({
        email: "contact@lunisoft.fr",
        password: "password",
        role: "ADMIN",
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        accessToken: expect.any(String),
      });
    });
  });
});
