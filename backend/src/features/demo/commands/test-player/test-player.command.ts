import {
  TestPlayerBodyInput,
  TestPlayerQueryInput,
} from './test-player.schema';

interface TestPlayerCommandProps {
  data: TestPlayerBodyInput;
  query: TestPlayerQueryInput;
}

export class TestPlayerCommand {
  public readonly data: TestPlayerBodyInput;
  public readonly query: TestPlayerQueryInput;

  constructor(props: TestPlayerCommandProps) {
    this.data = props.data;
    this.query = props.query;
  }
}
