"use client";

import { cn } from "@/lib/utils";
import { wolfios } from "@/lib/wolfios";
import { CloudUpload, FileIcon, Loader2, Trash } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Accept, DropEvent, FileRejection, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export type GhostDropzoneFile = {
  id?: string;
  path?: string;
  isUploading?: boolean;
};

/**
 * @param accept - Set the accepted file types that can be selected in the file dialog on the dropzone.
 * @param uploadUrl - The endpoint's url to upload the file to the server.
 * @returns
 */
const GhostDropzone = forwardRef<
  HTMLInputElement,
  {
    uploadUrl: string;
    maxFiles?: number;
    accept: Accept;
    errorMessage?: string;
    onChange: (files: GhostDropzoneFile[]) => void;
    value?: GhostDropzoneFile[] | null;
    classNames?: {
      container?: string;
      file?: string;
    };
    components?: {
      placeholder?: React.ReactNode;
    };
  }
>(
  (
    {
      uploadUrl,
      maxFiles = 1,
      accept,
      errorMessage,
      onChange,
      value,
      classNames,
      components,
    },
    ref
  ) => {
    const [files, setFiles] = useState<GhostDropzoneFile[]>([]);
    const hasPropagedInitialFiles = useRef(false);
    const onChangeRef = useRef(onChange);

    // ----------------
    // Propagate initial files to the state
    // ----------------
    useEffect(() => {
      if (value && value.length > 0 && !hasPropagedInitialFiles.current) {
        hasPropagedInitialFiles.current = true;
        setFiles(value);
      }
    }, [value]);

    // ----------------
    // Send the files objects to the parent component via the onChange prop
    // ----------------
    useEffect(() => {
      if (files) {
        onChangeRef.current(files.filter((f) => f.id !== undefined));
      }
    }, [files]);

    // ----------------
    // Handle new file drop
    // ----------------
    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        // Skip propagation of initial files to prevent infinite loop when we set new files
        hasPropagedInitialFiles.current = true;

        acceptedFiles.forEach((file) => {
          const tempId = uuidv4();

          setFiles((prevFiles) => [
            ...prevFiles,
            {
              id: tempId,
              isUploading: true,
              ...file,
            },
          ]);

          const formData = new FormData();
          formData.append("file", file);

          wolfios
            .post(uploadUrl, {
              body: formData,
            })
            .then(async (res) => await res.json())
            .then((data) => {
              setFiles((prevFiles) =>
                prevFiles.map((prevFile) => {
                  if (prevFile.id === tempId) {
                    return {
                      ...prevFile,
                      id: data.id,
                      isUploading: false,
                    };
                  }

                  return prevFile;
                })
              );
            })
            .catch((err) => {
              // ----------------
              // Handle file rejected error (server side)
              // ----------------
              if (err.data?.message) {
                toast.error(err.data.message);
              } else if (err.response.status === 413) {
                // 413 = Payload Too Large
                toast.error(`This file is too large.`);
              } else {
                toast.error("A problem occurred while sending this file.");
              }

              // Remove the file that has problem from the list
              setFiles((prevFiles) => prevFiles.filter((f) => f.id !== tempId));
            });
        });
      },
      [uploadUrl]
    );

    // ----------------
    // Handle file rejected errors (client side)
    // ----------------
    const onDropRejected = (
      fileRejection: FileRejection[],
      event: DropEvent
    ) => {
      // handle sent more files than maxFiles allowed error
      if (fileRejection.length > maxFiles) {
        toast.error(`You cannot send more than ${maxFiles} files.`);
        return;
      }

      // handle dropzone specific errors
      fileRejection.map((rejection) => {
        const errorCode = rejection.errors[0].code;
        const errorMessage = rejection.errors[0].message;
        const fileName = rejection.file.name;

        switch (errorCode) {
          case "file-invalid-type":
            toast.error(`The file type is not accepted. \n ${errorMessage}`);
            break;
          case "file-too-large":
            toast.error(`The file is too large. \n ${errorMessage}`);
            break;
          default:
            toast.error(`The file is not accepted. \n ${errorMessage}`);
            break;
        }
      });
    };

    // ----------------
    // Set dropzone options
    // ----------------
    const canAddMoreFiles = files.length < maxFiles;
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: onDrop,
      onDropRejected: onDropRejected,
      accept: accept,
      multiple: maxFiles > 1,
      maxFiles: maxFiles,
      noClick: !canAddMoreFiles, // Disable click events if maxFiles is reached
      noKeyboard: !canAddMoreFiles, // Disable keyboard events if maxFiles is reached
      noDrag: !canAddMoreFiles, // Disable drag events if maxFiles is reached
    });

    return (
      <>
        <div
          className={cn(
            "relative h-full w-full rounded-lg border-2 border-dashed bg-neutral-300/10 px-4 py-6 disabled:cursor-default",
            classNames?.container,
            errorMessage && "border-red-500",
            canAddMoreFiles ? "cursor-pointer" : "cursor-default",
            canAddMoreFiles && isDragActive && "border-primary bg-primary/10"
          )}
          {...getRootProps()}
        >
          {/* input is mandatory for mobile devices */}
          <input {...getInputProps()} />

          {components?.placeholder ||
            (canAddMoreFiles && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CloudUpload className="size-4" />
                <span className="block">
                  Drop a file here or click to upload
                </span>
              </div>
            ))}
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "my-2 flex items-center gap-4",
                file.isUploading && "animate-pulse"
              )}
            >
              <div className="flex items-center gap-2">
                {file.isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileIcon className="size-4" />
                )}
                <div>{file.path}</div>
                {!file.isUploading && (
                  <div
                    className="cursor-pointer p-1 hover:rounded-full hover:bg-neutral-300/30"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from bubbling up to the parent
                      e.preventDefault();
                      setFiles((prevFiles) =>
                        prevFiles.filter((f) => f !== file)
                      );
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Display error message */}
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </>
    );
  }
);
GhostDropzone.displayName = "GhostDropzone";

export { GhostDropzone };
