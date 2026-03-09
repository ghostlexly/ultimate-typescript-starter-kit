import { spawn } from 'child_process';
import { SpawnOptionsWithoutStdio } from 'node:child_process';

/**
 * Executes a command using spawn and returns the output as a string.
 * Rejects the promise if the command fails or returns a non-zero exit code.
 *
 * @param command The executable to run
 * @param args The arguments for the executable
 * @param options The options for the spawn process
 * @returns A promise that resolves with the stdout string
 */
export function asyncSpawn(
  command: string,
  args?: readonly string[],
  options?: SpawnOptionsWithoutStdio,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args ?? [], options ?? {});

    let stdoutData = '';
    let stderrData = '';

    // Collect data from stdout
    childProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    // Collect data from stderr
    childProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    // Handle process execution error (e.g., command not found)
    childProcess.on('error', (error) => {
      reject(error);
    });

    // Handle process exit
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData.trim()); // Resolve with output
      } else {
        // Reject with the error message and exit code
        reject(new Error(`Command failed with code ${code}\nStderr: ${stderrData}`));
      }
    });
  });
}
