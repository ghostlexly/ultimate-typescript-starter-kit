export class UploadVideoCommand {
  constructor(public readonly file: Express.Multer.File) {}
}
