import type { DemoTestPlayerDto } from './test-player.request.dto';

interface TestPlayerCommandProps {
  body: DemoTestPlayerDto['body'];
  query: DemoTestPlayerDto['query'];
}

export class TestPlayerCommand {
  public readonly body: DemoTestPlayerDto['body'];
  public readonly query: DemoTestPlayerDto['query'];

  constructor(props: TestPlayerCommandProps) {
    this.body = props.body;
    this.query = props.query;
  }
}
