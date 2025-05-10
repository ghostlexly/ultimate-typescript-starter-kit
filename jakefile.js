const { spawn } = require("child_process");

desc("This is the default task.");
task("default", function () {
  jake.showAllTaskDescriptions();
});

desc("Start the development environment.");
task("dev", async () => {
  await asyncSpawn(
    "docker compose -f docker-compose.yml -f docker-compose.dev.yml up --renew-anon-volumes"
  );
});

// -- PRISMA --
namespace("prisma", function () {
  desc("Generate Prisma Client files.");
  task("g", async () => {
    await asyncSpawn("cd backend && npx prisma generate"); // Generate Prisma Client files on local
    await asyncSpawn("docker compose exec backend npx prisma generate"); // Generate Prisma Client files on docker containr
    await asyncSpawn("docker compose restart backend");
  });

  // Migrations
  namespace("m", function () {
    desc("Automatically generate new Prisma migration.");
    task("g", async () => {
      await asyncSpawn(
        "docker compose exec backend npx prisma migrate dev --create-only"
      );
    });

    desc("Apply the latest Prisma migrations.");
    task("m", async () => {
      await asyncSpawn("docker compose exec backend npx prisma migrate deploy");
      await asyncSpawn("cd backend && npx prisma generate"); // Generate Prisma Client files on local
      await asyncSpawn("docker compose exec backend npx prisma generate"); // Generate Prisma Client files on docker containr
      await asyncSpawn("docker compose restart backend");
    });

    desc(
      "Check if my database is up to date with my schema file or if i need to create a migration."
    );
    task("diff", async () => {
      await asyncSpawn(
        "docker compose exec backend npx prisma migrate diff --from-schema-datasource prisma/schema.prisma  --to-schema-datamodel prisma/schema.prisma  --script"
      );
    });
  });
});

desc("Run CLI commands in the backend container with arguments.");
task("cli", async () => {
  // Get raw arguments without processing/joining them
  const rawArgs = process.argv.slice(3);

  // Process arguments to preserve quotes
  const processedArgs = rawArgs
    .map((arg) => {
      // If argument contains spaces, wrap it in quotes
      return arg.includes(" ") ? `"${arg}"` : arg;
    })
    .join(" ");

  const command = `docker compose exec backend npm run cli -- ${processedArgs}`;
  await asyncSpawn(command);
  // If asyncSpawn completes without throwing, the command was successfully executed.
  // Exit to prevent Jake from interpreting subsequent arguments as tasks.
  log("CLI command processed successfully. Exiting Jake.");
  process.exit(0);
});

// ----------------------------------------------
// Helper functions
// ----------------------------------------------
const log = (message) => {
  console.log(`\x1b[32m[Jake] - ${message} \x1b[0m`);
};

const asyncSpawn = (command, options) => {
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

      log(`Child process exited with code ${code}.`);
      resolve();
    });

    childProcess.on("error", (error) => {
      reject(`Error on process spawn: ${error.message}.`);
    });

    // Handle the SIGINT signal (Ctrl+C) to stop the child process before exiting
    process.on("SIGINT", () => {
      childProcess.kill();
    });
  });
};
