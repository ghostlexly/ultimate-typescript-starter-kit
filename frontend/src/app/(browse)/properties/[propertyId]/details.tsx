import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Details = ({ property }) => {
  const priceFormatter = Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Critères</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={"grid grid-cols-1 gap-6 lg:grid-cols-3"}>
            <Detail icon="📍" title="Adresse" value={property.data.address} />
            <Detail
              icon="💸"
              title="Taxe foncière"
              value={priceFormatter.format(property.data.landTax)}
            />
            <Detail
              icon="🏘️"
              title="Charges de copropriété"
              value={priceFormatter.format(property.data.coOwnershipCharges)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const Detail = ({ icon, title, value }) => {
  return (
    <div className="flex flex-row items-start gap-2">
      <div className="rounded-full bg-muted p-2 text-xs">{icon}</div>

      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div>{value}</div>
      </div>
    </div>
  );
};
export { Details };
