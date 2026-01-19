export class GetAllCountriesQuery {
  public readonly language: string;

  constructor(props: { language: string }) {
    this.language = props.language;
  }
}
