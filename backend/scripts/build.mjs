import { spawn } from "child_process";
import fs from "fs/promises";
import { glob } from "glob";
import path from "path";

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
   * Copy non-TypeScript files to the dist directory
   */
  copyNonTsFiles = async () => {
    const nonTsFiles = await glob("**/*", {
      ignore: ["**/*.{ts,tsx,js,jsx}", "**/node_modules/**", "dist/**"],
      nodir: true,
      cwd: "src",
    });

    for (const file of nonTsFiles) {
      const sourcePath = path.join("src", file);
      const destPath = path.join("dist", "src", file);

      // Ensure the destination directory exists
      await fs.mkdir(path.dirname(destPath), { recursive: true });

      // Copy the file
      await fs.copyFile(sourcePath, destPath);
    }
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

      await this.buildCss();
      await Promise.all([this.buildJs(), this.copyNonTsFiles()]);

      console.log("Build completed successfully");
    } catch (error) {
      console.error("Build failed:", error);
      process.exit(1);
    }
  };
}

const builder = new Builder();
builder.build();
