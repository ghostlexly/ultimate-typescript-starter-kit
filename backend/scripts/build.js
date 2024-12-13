const { spawn } = require("child_process");
const fs = require("fs/promises");
const { existsSync } = require("fs");

/**
 * Do command line command.
 */
const exec = async (cmd) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true });

    child.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
};

/**
 * Copy assets from src to dist
 */
const copyAssets = async () => {
  const srcDir = "src/static";
  const destDir = "dist/src/static";

  // Check if source directory exists
  if (!existsSync(srcDir)) {
    console.log("Assets directory does not exist, skipping copy");
    return;
  }

  try {
    // Create destination directory if it doesn't exist
    await fs.mkdir(destDir, { recursive: true });

    // Copy all files recursively
    await fs.cp(srcDir, destDir, { recursive: true });
  } catch (error) {
    console.error("Error copying assets:", error);
    throw error;
  }
};

/**
 * Copy templates from src to dist
 */
const copyTemplates = async () => {
  const srcDir = "src/common/templates";
  const destDir = "dist/src/common/templates";

  // Check if source directory exists
  if (!existsSync(srcDir)) {
    console.log("Templates directory does not exist, skipping copy");
    return;
  }

  try {
    // Create destination directory if it doesn't exist
    await fs.mkdir(destDir, { recursive: true });

    // Copy all files recursively
    await fs.cp(srcDir, destDir, { recursive: true });
  } catch (error) {
    console.error("Error copying templates:", error);
    throw error;
  }
};

/**
 * Build TypeScript files
 */
const buildJs = async () => {
  try {
    await exec("yarn tsc --build --incremental");
    await exec("yarn tsc-alias");
  } catch (error) {
    console.error("Error building JavaScript:", error);
    throw error;
  }
};

/**
 * Build CSS files
 */
const buildCss = async () => {
  await exec("yarn build:css");
};

/**
 * Main build function
 */
const main = async () => {
  try {
    console.log("Building...");

    await buildJs();
    await buildCss();
    await copyAssets();
    await copyTemplates();

    console.log("Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};

main();
