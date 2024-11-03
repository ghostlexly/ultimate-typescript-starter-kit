import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import express from "express";

export const initializeSwagger = ({ app }: { app: express.Application }) => {
  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.1.0",
      info: {
        title: "API Documentation",
        description: "Welcome to the API documentation.",
        version: "1.0.0",
      },
      // security: [
      //   {
      //     bearerAuth: [], // apply to all routes
      //   },
      // ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            name: "access-token",
          },
        },
      },
      servers: [
        {
          url: "http://localhost",
          description: "Local development server",
        },
        {
          url: "https://dispomenage.fr",
          description: "Production server",
        },
      ],
    },
    apis: ["./src/modules/**/*.routes.ts", "./src/modules/**/*.controller.ts"],
  });

  app.get("/api/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    "/api/swagger",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        filter: true,
        showRequestDuration: true,
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
    })
  );
};
