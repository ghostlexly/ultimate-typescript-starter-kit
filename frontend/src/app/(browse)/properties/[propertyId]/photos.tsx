import { GhostImage } from "@/components/ui/ghost-image";
import { s3 } from "@/lib/s3";
import { cn } from "@/lib/utils";

const PhotosCard = ({ property, setIsImagesCarouselDialogOpen }) => {
  if (property.data?.photos.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center lg:col-span-3">
          <span>Aucune photo n'a été ajoutée pour le moment</span>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="lg:col-span-3">
        <div
          className={cn(
            "relative grid cursor-pointer grid-cols-1 gap-4",
            property.data?.photos?.length > 1 && "grid-cols-2"
          )}
          onClick={() => setIsImagesCarouselDialogOpen(true)}
        >
          <div className="relative h-96 w-full">
            <GhostImage
              src={s3.getDomainName() + property.data?.photos[0].fileKey}
              alt={property.data?.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {property.data?.photos.length > 1 && (
            <div className="flex h-96 flex-col gap-4">
              <div className="relative flex-1">
                <GhostImage
                  src={s3.getDomainName() + property.data?.photos[1]?.fileKey}
                  alt={property.data?.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {property.data?.photos.length > 2 && (
                <div className="relative flex-1">
                  <GhostImage
                    src={s3.getDomainName() + property.data?.photos[2]?.fileKey}
                    alt={property.data?.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-3 right-3 rounded-xl bg-white px-4 py-2 text-sm shadow-xl">
            Voir les {property.data?.photos.length} photos
          </div>
        </div>
      </div>
    </>
  );
};

export { PhotosCard };
