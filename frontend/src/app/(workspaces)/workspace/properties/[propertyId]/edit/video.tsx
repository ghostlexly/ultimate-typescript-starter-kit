import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GhostDropzone } from "@/components/ui/ghost-dropzone";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormValues } from "./page";

const VideoCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vidéo</CardTitle>
        <CardDescription>
          La vidéo du bien est utilisée de manière publique pour présenter le
          bien.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="video"
            render={({ field, fieldState }) => (
              <GhostDropzone
                {...field}
                maxFiles={1}
                uploadUrl="/api/media/video"
                accept={{
                  "video/*": [".mp4", ".mov"],
                }}
                errorMessage={fieldState.error?.message}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { VideoCard };
