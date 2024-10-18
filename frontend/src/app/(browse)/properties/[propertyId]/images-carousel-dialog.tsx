import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GhostImage } from "@/components/ui/ghost-image";
import { Video } from "./video";
import { s3 } from "@/lib/s3";

const ImagesCarouselDialog = ({
  isOpen,
  setIsOpen,
  property,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  property: any;
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-full pt-8">
          <Carousel
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {property.data.photos.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[calc(100dvh-4rem)] w-full">
                    <GhostImage
                      src={s3.getDomainName() + image.fileKey}
                      alt={image.fileKey}
                      className="object-contain"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              ))}

              {property.data.video && (
                <CarouselItem>
                  <div className="relative h-full max-h-[calc(100dvh-4rem)] w-full">
                    <Video property={property} />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ImagesCarouselDialog };
