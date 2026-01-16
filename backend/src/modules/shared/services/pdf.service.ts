import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Browser, BrowserContext, chromium, devices } from 'playwright';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private logger = new Logger(PdfService.name);
  private browser?: Browser;
  private context?: BrowserContext;

  /**
   * Get the browser instance
   * If the browser is not initialized, it will create a new one
   */
  getBrowser = async () => {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true, // If true, hide the browser, if false, show the browser
      });
    }

    return this.browser;
  };

  /**
   * Get the context instance
   * If the context is not initialized, it will create a new one.
   * If the browser is not initialized yet, it will create a new one too.
   * You can use the context to create pages.
   */
  getContext = async () => {
    if (!this.context) {
      const browser = await this.getBrowser();
      this.context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1920,
          height: 1080,
        },
      });
    }

    return this.context;
  };

  /**
   * Generate a PDF from an HTML string
   * @param html - The HTML string to generate a PDF from
   */
  htmlToPdf = async ({
    html,
    footerHtml,
  }: {
    html: string;
    footerHtml?: string;
  }) => {
    // Launch browser
    const context = await this.getContext();
    const page = await context.newPage();

    // Set content and wait for loading
    await page.setContent(html, { waitUntil: 'load' });

    // Wait for fonts to load
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '60px', // Increased bottom margin to accommodate footer
        left: '20px',
      },
      printBackground: true,
      displayHeaderFooter: footerHtml ? true : false,
      footerTemplate: footerHtml,
      headerTemplate: '<div></div>', // Empty header template to avoid default header
    });

    // Close page
    await page.close();

    return pdfBuffer;
  };

  /**
   * Ensure Playwright resources are released when the Nest module is destroyed
   * (e.g., on hot-reload or graceful shutdown)
   */
  async onModuleDestroy() {
    try {
      if (this.context) {
        await this.context.close();
        this.context = undefined;
      }
    } catch (error) {
      this.logger.warn(`Error closing Playwright context - ${error.message}`);
    }
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = undefined;
      }
    } catch (error) {
      this.logger.warn(`Error closing Playwright browser - ${error.message}`);
    }
  }
}
