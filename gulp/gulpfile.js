// Change working directory to the root of the project
process.chdir("../");

require("dotenv/config");
const gulp = require("gulp");
const { exec, spawn } = require("child_process");
const { Client } = require("ssh2");

// ----------------------------------------
// UTILS
// ----------------------------------------

const log = (message) => {
  console.log(`\x1b[32m[GULP] - ${message} \x1b[0m`);
};

const defineTask = (name, description, taskFunction) => {
  taskFunction.description = description;
  gulp.task(name, taskFunction);
};

/**
 * Run a command asynchronously and return a promise that resolves when the command finishes.
 */
const asyncSpawn = async (command, throwError = true) => {
  log(`Running command: ${command}`);

  return await new Promise((resolve, reject) => {
    const childProcess = spawn(command, {
      stdio: ["inherit", "inherit", "inherit"], // This pipes both stdout and stderr
      shell: true, // Enables the execution of the command within a shell
      env: { ...process.env, FORCE_COLOR: "true" }, // Include existing environment variables and force color
    });

    childProcess.on("exit", (code) => {
      if (code !== 0 && throwError) {
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

/**
 * Get the value of a command line argument passed to the task.
 */
const getCommandLineArg = (argName, isOptional = false) => {
  const args = process.argv;
  const index = args.indexOf(`--${argName}`);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]; // Return the argument value that follows the flag
  } else if (!isOptional) {
    throw new Error(`Required argument --${argName} not found.`);
  }
  return null; // Return null if the argument is optional and not found
};

/**
 * Run a command on a remote server via SSH.
 */
async function runCommandViaSSH({ hostConfig, command }) {
  log(`ssh ${hostConfig.username}@${hostConfig.host}: ${command}`);

  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        // console.log("Client :: ready");
        conn.exec(command, (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          let stdout = "";
          let stderr = "";

          stream
            // -- handle on close
            .on("close", (code, signal) => {
              // console.log(
              //   "Stream :: close :: code: " + code + ", signal: " + signal
              // );
              conn.end();

              if (code === 0) {
                resolve(stdout);
              } else {
                reject(
                  new Error(
                    `SSH command finished with exit code ${code} and signal ${signal}: ${stderr}.`
                  )
                );
              }
            })

            // -- log stdout
            .on("data", (data) => {
              console.log(data.toString().trim());
              stdout += data.toString().trim();
            })

            // -- log stderr
            .stderr.on("data", (data) => {
              console.error(data.toString().trim());
              stderr += data.toString().trim();
            });
        });
      })
      .on("error", (err) => {
        reject(err);
      })
      .connect(hostConfig);
  });
}

/**
 * Transfer a file to a remote server via SCP.
 */
const transferFile = async ({
  serverIp,
  serverUser,
  localFilePath,
  destinationFilePath,
}) => {
  await asyncSpawn(
    `scp ${localFilePath} ${serverUser}@${serverIp}:${destinationFilePath}`
  );
};

// ----------------------------------------
// DEFINE TASKS
// ----------------------------------------

const { CI_IP, DEPLOYMENT_SERVER_IP, DEPLOYMENT_SERVER_USER } = process.env;

// builder server host configuration
const builderHostConfig = {
  host: CI_IP,
  port: 22,
  username: "ubuntu",
  agent: process.env.SSH_AUTH_SOCK, // Use the SSH agent (with private keys) of the host machine for authentication
};

// production server host configuration
const deploymentHostConfig = {
  host: DEPLOYMENT_SERVER_IP,
  port: 22,
  username: DEPLOYMENT_SERVER_USER,
  agent: process.env.SSH_AUTH_SOCK, // Use the SSH agent (with private keys) of the host machine for authentication
};

defineTask("dev", "Start the development environment", async (done) => {
  await asyncSpawn(
    "docker compose -f docker-compose.yml -f docker-compose.dev.yml up",
    false
  );
});

// -- PRISMA --
defineTask(
  "prisma:m:g",
  "Automatically generate new Prisma migration.",
  async (done) => {
    await asyncSpawn(
      "docker compose exec backend yarn prisma migrate dev --create-only"
    );
  }
);

defineTask(
  "prisma:m:m",
  "Apply the latest Prisma migrations.",
  async (done) => {
    await asyncSpawn("docker compose exec backend yarn prisma migrate deploy");
    gulp.series(["prisma:g"])(); // run commands in series (one after the other)
  }
);

defineTask(
  "prisma:m:diff",
  "Check if my database is up to date with my schema file or if i need to create a migration.",
  async (done) => {
    await asyncSpawn(
      "docker compose exec backend yarn prisma migrate diff --from-schema-datasource prisma/schema.prisma  --to-schema-datamodel prisma/schema.prisma  --script"
    );
  }
);

defineTask("prisma:g", "Generate Prisma Client files", async (done) => {
  await asyncSpawn("docker compose exec backend yarn prisma generate");
  await asyncSpawn("docker compose restart backend");
});
