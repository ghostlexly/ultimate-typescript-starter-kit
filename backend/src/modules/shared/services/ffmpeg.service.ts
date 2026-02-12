import { Injectable } from '@nestjs/common';
import { asyncSpawn } from '../../core/utils/process';

@Injectable()
export class FfmpegService {
  /**
   * Process the video encoding with ffmpeg to optimize the video file for all web browsers.
   *
   * Safari compatibility requires: -vf "format=yuv420p"
   */
  async processVideoEncoding({ inputFilePath, outputFilePath }) {
    return await asyncSpawn(
      `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset fast -crf 26 -vf "format=yuv420p" -c:a aac -b:a 128k -movflags +faststart -f mp4 "${outputFilePath}"`,
      [],
      {
        shell: true,
      },
    );
  }
}
