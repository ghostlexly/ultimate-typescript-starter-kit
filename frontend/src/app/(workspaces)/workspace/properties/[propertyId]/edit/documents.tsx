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

const DocumentsCard = ({ form }: { form: UseFormReturn<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Mettez à disposition les documents liés au bien. <br />
          Format accepté: Uniquement PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="documents"
            render={({ field, fieldState }) => (
              <GhostDropzone
                {...field}
                maxFiles={20}
                uploadUrl="/api/media"
                accept={{
                  "application/pdf": [".pdf"],
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

export { DocumentsCard };
