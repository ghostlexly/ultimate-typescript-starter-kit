import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import { GeneratePdfQuery } from './generate-pdf.query';
import { PdfService } from 'src/features/application/services/pdf.service';

@QueryHandler(GeneratePdfQuery)
export class GeneratePdfQueryHandler
  implements IQueryHandler<GeneratePdfQuery>
{
  constructor(private readonly pdfService: PdfService) {}

  async execute(): Promise<Buffer> {
    // Get template
    const template = await fs.readFile(
      path.join(process.cwd(), 'views', 'invoice.hbs'),
      'utf-8',
    );

    // Render template
    const compileTemplate = handlebars.compile(template);
    const renderedTemplate = compileTemplate(
      {
        name: 'John Doe',
      },
      {
        helpers: {
          formatCurrency: (value: unknown) => {
            const numericValue =
              typeof value === 'number' ? value : Number(value);

            return new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(numericValue);
          },
          formatDate: (date: string) => {
            return new Intl.DateTimeFormat('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(date));
          },
        },
      },
    );

    // Generate PDF
    const pdfBuffer = await this.pdfService.htmlToPdf({
      html: renderedTemplate,
    });

    return pdfBuffer;
  }
}
