import { Badge } from "@/components/ui/badge";

const PropertyStatusBadge = ({ property }) => {
  if (property.data?.status === "AVAILABLE") {
    return (
      <Badge variant={"custom"} className="bg-green-100">
        <div className="flex items-center justify-center gap-1">
          <span className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <div className="text-sm text-green-600">Disponible à l'achat</div>
        </div>
      </Badge>
    );
  }

  if (property.data?.status === "SOLD") {
    return (
      <Badge variant={"custom"} className="bg-red-100">
        <div className="flex items-center justify-center gap-1">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
          <div className="text-sm text-red-500">Vendu</div>
        </div>
      </Badge>
    );
  }
};

export { PropertyStatusBadge };
