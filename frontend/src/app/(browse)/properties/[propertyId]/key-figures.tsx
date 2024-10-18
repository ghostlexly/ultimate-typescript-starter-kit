import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KeyFigures = ({ property }) => {
  const priceFormatter = Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiffres Clés</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>🏠</span>
              <span className="text-muted-foreground">Type</span>
            </div>
            <span>{property.data.rooms}</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>📏 </span>
              <span className="text-muted-foreground">Surface habitable</span>
            </div>
            <span>{property.data.squareMeters} m²</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>🔨</span>
              <span className="text-muted-foreground">
                Montant estimé des travaux
              </span>
            </div>
            <span>
              {priceFormatter.format(property.data.estimatedWorkPrice)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span>🔐</span>
              <span className="text-muted-foreground">Libre de location</span>
            </div>
            <span>
              {property.data.freeToRent ? (
                <Badge variant={"custom"} className="bg-green-100">
                  <div className="flex items-center justify-center gap-1">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    <div className="text-sm text-green-500">Oui</div>
                  </div>
                </Badge>
              ) : (
                <Badge variant={"custom"} className="bg-red-100">
                  <div className="flex items-center justify-center gap-1">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                    <div className="text-sm text-red-500">Non</div>
                  </div>
                </Badge>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { KeyFigures };
