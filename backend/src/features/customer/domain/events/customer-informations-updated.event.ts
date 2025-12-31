import {
  DomainEvent,
  DomainEventProps,
} from 'src/core/ddd/domain/domain-event.base';

interface CustomerInformationsUpdatedEventProps extends DomainEventProps {
  customerId: string;
  countryCode: string;
  cityId: string;
}

export class CustomerInformationsUpdatedEvent extends DomainEvent {
  readonly customerId: string;
  readonly countryCode: string;
  readonly cityId: string;

  constructor(props: CustomerInformationsUpdatedEventProps) {
    super(props);
    this.customerId = props.customerId;
    this.countryCode = props.countryCode;
    this.cityId = props.cityId;
  }

  get eventName(): string {
    return 'customer.informations.updated';
  }
}
