import { UpdateCustomerInformationsRequestDto } from './update-customer-informations.request.dto';

interface UpdateCustomerInformationsCommandProps {
  accountId: string;
  data: UpdateCustomerInformationsRequestDto['body'];
}

export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly data: UpdateCustomerInformationsRequestDto['body'];

  constructor(props: UpdateCustomerInformationsCommandProps) {
    this.accountId = props.accountId;
    this.data = props.data;
  }
}
