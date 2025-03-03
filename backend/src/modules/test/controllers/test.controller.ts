import { NextFunction, Request, Response } from "express";
import { testConfig } from "../test.config";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";
import { testService } from "../test.service";
import { HttpException } from "@/common/exceptions/http-exception";
import { UpdateAccountValidator } from "../validators/test.validators";
import { eventsService } from "@/common/events/events.service";
import { getAppDir } from "@/common/utils/app-dir";
import { pdfService } from "@/common/services/pdf.service";
import { testWriteTextUseCase } from "@/core/use-cases/test-write-text.usecase";
import { toAccountDto } from "../dtos/account.dto";
import { queueService } from "@/common/queue/queue.service";

export class TestController {
  testBadRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      throw HttpException.badRequest({
        message: "An error occurred.",
        code: "TEST_BAD_REQUEST",
      });

      // throw new HttpException({
      //   status: 400,
      //   body: "An error occurred.",
      //   code: "TEST_BAD_REQUEST",
      // });
    } catch (error) {
      next(error);
    }
  };

  testQueueLaunch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      queueService.addTestingJob("Hello World");

      return res.json({
        message: "Job added to queue.",
      });
    } catch (error) {
      next(error);
    }
  };

  testZod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as UpdateAccountValidator["body"];

      return res.json(body);
    } catch (error) {
      next(error);
    }
  };

  testDto = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = {
        id: "123",
        name: "John Doe",
        thiswillalsoberemoved: "This will be removed too",
        extraData: {
          id: "456",
          name: "John Abc",
          thiswillberemoved: "This will be removed",
        },
      };

      const accountDto = toAccountDto(data);

      return res.json(accountDto);
    } catch (error) {
      next(error);
    }
  };

  testEventEmitter = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await eventsService.emitAsync("test.event", "Hello World");

      return res.json({
        message: "Event emitted.",
      });
    } catch (error) {
      next(error);
    }
  };

  testDependencyInjection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = testService.example();

      return res.json({
        message: result,
        commissionRate: testConfig.defaultCommissionRate,
      });
    } catch (error) {
      next(error);
    }
  };

  testPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get template
      const template = await fs.readFile(
        path.join(getAppDir(), "shared", "views", "invoice.ejs"),
        "utf-8"
      );

      // Render template
      const renderedTemplate = ejs.render(template, {});

      // Generate PDF
      const pdfBuffer = await pdfService.htmlToPdf({ html: renderedTemplate });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  testComplexUseCase = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = testWriteTextUseCase.execute();

      return res.json({
        message: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const testController = new TestController();
