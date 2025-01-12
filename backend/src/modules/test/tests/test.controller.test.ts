import request from "supertest";
import { bootstrap } from "#/app";
import { Express } from "express";

let app: Express;

beforeAll(async () => {
  app = await bootstrap();
});

describe("AdminCartController", () => {
  describe("GET /api/tests/bad-request", () => {
    it("should return empty cart list", async () => {
      const response = await request(app).get("/api/tests/bad-request");

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "An error occurred.",
        code: "TEST_BAD_REQUEST",
      });
    });
  });
});
