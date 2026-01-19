export class GetCitiesQuery {
  public readonly page?: number;
  public readonly first?: number;
  public readonly sort?: string;
  public readonly include?: string | string[];
  public readonly search?: string;

  constructor(props: {
    page?: number;
    first?: number;
    sort?: string;
    include?: string | string[];
    search?: string;
  }) {
    this.page = props.page;
    this.first = props.first;
    this.sort = props.sort;
    this.include = props.include;
    this.search = props.search;
  }
}
