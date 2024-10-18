import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "../dialog";
import { GhostImage } from "../ghost-image";

type Media = {
  src: string;
  alt: string;
};

const ImagesCarouselDialog = ({
  isOpen,
  setIsOpen,
  images,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  images: Media[];
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
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-full max-h-[calc(100dvh-4rem)] w-full">
                    <GhostImage
                      src={image.src}
                      alt={image.alt}
                      className="object-contain"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              ))}
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
