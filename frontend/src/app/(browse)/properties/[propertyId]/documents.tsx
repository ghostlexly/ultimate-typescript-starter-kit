import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfSvg } from "@/components/ui/svgs/pdf";
import { s3 } from "@/lib/s3";
import { Eye } from "lucide-react";
import Link from "next/link";

const Documents = ({ property }) => {
  if (property.data?.documents?.length === 0) return null;

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Documents mis à disposition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-full w-full rounded-lg border-2 border-dashed bg-neutral-300/10 px-4 py-6">
          <div className="my-2 flex flex-col gap-4">
            {property.data?.documents?.map((document) => (
              <File key={document.id} document={document} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const File = ({ document }) => {
  return (
    <Link href={`${s3.getDomainName()}${document.fileKey}`} target="_blank">
      <div className="flex cursor-pointer items-center gap-2">
        <PdfSvg className="h-4 w-4" />
        <span>{document.fileName}</span>
        <Eye className="h-4 w-4" />
      </div>
    </Link>
  );
};

export { Documents };
