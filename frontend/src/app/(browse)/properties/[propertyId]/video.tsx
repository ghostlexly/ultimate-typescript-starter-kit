import NoSsr from "@/components/ui/no-ssr";
import { s3 } from "@/lib/s3";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";

const Video = ({ property }) => {
  return (
    <>
      <NoSsr fallback={<div>Loading...</div>}>
        <MediaPlayer
          title="Votre vidéo personnalisée"
          className="h-full w-full"
        >
          <MediaProvider>
            <source
              src={s3.getDomainName() + property.data.video?.fileKey}
              type="video/mp4"
            />
            {/* <Poster
                    className="absolute inset-0 block h-full w-full bg-black rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
                    src={`/api/media/${data.thumbnailId}`}
                    alt="Video Thumbnail"
                  /> */}
          </MediaProvider>
          <DefaultVideoLayout
            // thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt" // This will display thumbnails images on the seek bar
            icons={defaultLayoutIcons}
          />
        </MediaPlayer>
      </NoSsr>
    </>
  );
};

export { Video };
