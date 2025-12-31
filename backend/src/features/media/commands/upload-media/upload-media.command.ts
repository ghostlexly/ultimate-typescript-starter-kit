export class UploadMediaCommand {
  constructor(public readonly file: Express.Multer.File) {}
}
