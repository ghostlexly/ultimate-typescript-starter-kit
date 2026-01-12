import { UpdateCustomerInformationsInput } from './update-customer-informations.schema';

interface UpdateCustomerInformationsCommandProps {
  accountId: string;
  data: UpdateCustomerInformationsInput;
}

export class UpdateCustomerInformationsCommand {
  public readonly accountId: string;
  public readonly data: UpdateCustomerInformationsInput;

  constructor(props: UpdateCustomerInformationsCommandProps) {
    this.accountId = props.accountId;
    this.data = props.data;
  }
}
