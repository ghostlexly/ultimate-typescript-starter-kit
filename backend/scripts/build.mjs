import { spawn } from "child_process";
import fs from "fs/promises";
import { existsSync } from "fs";

class Builder {
  /**
   * Do command line command.
   */
  asyncSpawn = (command, options = {}) => {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, {
        shell: true,
        stdio: ["inherit", "inherit", "inherit"],
        ...options,
      });

      childProcess.on("exit", (code) => {
        if (code !== 0) {
          reject(`Child process exited with code ${code}.`);
        }
        resolve(true);
      });

      childProcess.on("error", (error) => {
        reject(`Error on process spawn: ${error.message}.`);
      });

      process.on("exit", () => {
        childProcess.kill();
      });
    });
  };

  /**
   * Copy files from source to destination directory
   */
  copyFiles = async (srcDir, destDir, type) => {
    if (!existsSync(srcDir)) {
      console.log(`${type} directory does not exist, skipping copy`);
      return;
    }

    try {
      await fs.mkdir(destDir, { recursive: true });
      await fs.cp(srcDir, destDir, { recursive: true });
    } catch (error) {
      console.error(`Error copying ${type}:`, error);
      throw error;
    }
  };

  /**
   * Copy assets from src to dist
   */
  copyAssets = async () => {
    await this.copyFiles("src/static", "dist/src/static", "Assets");
  };

  /**
   * Copy views from src to dist
   */
  copyViews = async () => {
    await this.copyFiles("src/shared/views", "dist/src/shared/views", "Views");
  };

  /**
   * Build TypeScript files
   */
  buildJs = async () => {
    try {
      await this.asyncSpawn("npx tsc --build --incremental");
      await this.asyncSpawn("npx tsc-alias");
    } catch (error) {
      console.error("Error building JavaScript:", error);
      throw error;
    }
  };

  /**
   * Build CSS files
   */
  buildCss = async () => {
    await this.asyncSpawn("npm run build:css");
  };

  /**
   * Main build function
   */
  build = async () => {
    try {
      console.log("Building...");

      await Promise.all([this.buildJs(), this.buildCss(), this.copyViews()]);
      await this.copyAssets();

      console.log("Build completed successfully");
    } catch (error) {
      console.error("Build failed:", error);
      process.exit(1);
    }
  };
}

const builder = new Builder();
builder.build();
