import { Controller, Get, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GeneratePdfQuery } from './generate-pdf.query';

@Controller()
export class GeneratePdfHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/pdf-generation')
  @AllowAnonymous()
  async generatePdf(@Res() res: Response) {
    const pdfBuffer = await this.queryBus.execute<GeneratePdfQuery, Buffer>(
      new GeneratePdfQuery(),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');

    return res.send(pdfBuffer);
  }
}
