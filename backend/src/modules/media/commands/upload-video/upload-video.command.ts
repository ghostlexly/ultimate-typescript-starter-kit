interface UploadVideoCommandProps {
  file: Express.Multer.File;
}

export class UploadVideoCommand {
  public readonly file: Express.Multer.File;

  constructor(props: UploadVideoCommandProps) {
    this.file = props.file;
  }
}
