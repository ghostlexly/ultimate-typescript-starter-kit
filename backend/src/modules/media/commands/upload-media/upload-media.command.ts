interface UploadMediaCommandProps {
  file: Express.Multer.File;
}

export class UploadMediaCommand {
  public readonly file: Express.Multer.File;

  constructor(props: UploadMediaCommandProps) {
    Object.assign(this, props);
  }
}
