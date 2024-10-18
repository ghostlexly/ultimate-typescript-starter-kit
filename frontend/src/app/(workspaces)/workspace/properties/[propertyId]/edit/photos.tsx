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

const PhotosCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Les photos du bien sont utilisées de manière publique et sont
          distribuées sur les réseaux. <br />
          La première photo est utilisée comme photo de couverture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="photos"
            render={({ field, fieldState }) => (
              <GhostDropzone
                {...field}
                maxFiles={20}
                uploadUrl="/api/media"
                accept={{
                  "image/*": [".jpg", ".jpeg", ".png"],
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

export { PhotosCard };
