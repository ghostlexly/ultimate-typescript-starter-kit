interface GetAllCountriesQueryProps {
  language: string;
}

export class GetAllCountriesQuery {
  public readonly language: string;

  constructor(props: GetAllCountriesQueryProps) {
    this.language = props.language;
  }
}
