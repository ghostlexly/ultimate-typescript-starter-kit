"use client";

import { s3 } from "@/lib/s3";
import { Card, CardContent } from "../card";
import { GhostImage } from "../ghost-image";
import Link from "next/link";

const PropertyCard = ({
  id,
  name,
  price,
  possibleRentalPrice,
  estimatedWorkPrice,
  photos,
  address,
}) => {
  const priceFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <>
      <Link href={`/properties/${id}`}>
        <Card className="shadow-lg transition-all duration-300 hover:scale-105 hover:cursor-pointer">
          <CardContent className="p-0">
            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
              <GhostImage
                src={s3.getDomainName() + photos[0].fileKey}
                alt={name}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>

            <div className="flex flex-col gap-2 p-6">
              <div className="text-2xl font-bold">
                {priceFormatter.format(price)}
              </div>
              <div className="text-sm text-muted-foreground">{name}</div>

              <div className="my-1" />

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>🔨</span>
                <p>{priceFormatter.format(estimatedWorkPrice)}</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>💶</span>
                <p>{priceFormatter.format(possibleRentalPrice)} / mois</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>📍</span>
                <p>{address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
};

export { PropertyCard };
