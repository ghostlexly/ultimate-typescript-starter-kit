'use client';

import { cn } from '@/lib/utils';
import { wolfios } from '@/lib/wolfios/wolfios';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CloudUploadIcon,
  EyeIcon,
  FileIcon,
  Loader2Icon,
  TrashIcon,
} from 'lucide-react';
import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Accept, DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

// Constants
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Ce fichier est trop volumineux.',
  UPLOAD_FAILED: "Un problème est survenu lors de l'envoi de ce fichier.",
  MAX_FILES_EXCEEDED: (maxFiles: number) =>
    `Vous ne pouvez pas envoyer plus de ${maxFiles} fichiers.`,
  INVALID_TYPE: (message: string) =>
    `Le type de fichier n'est pas accepté. \n ${message}`,
  FILE_TOO_LARGE_DETAIL: (message: string) =>
    `Le fichier est trop volumineux. \n ${message}`,
  DEFAULT_REJECTION: (message: string) => `Le fichier n'est pas accepté. \n ${message}`,
};

// Types
export type GhostDropzoneFile = {
  id?: string;
  path?: string;
  isUploading?: boolean;
  previewUrl?: string;
};

interface FileItemProps {
  file: GhostDropzoneFile;
  onDelete: (file: GhostDropzoneFile) => void;
  className?: string;
}

interface PlaceholderProps {
  custom?: React.ReactNode;
  isVisible: boolean;
  isDragActive: boolean;
}

interface GhostDropzoneProps {
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

/**
 * Component to display a single file item in the dropzone
 */
const FileItem = ({ file, onDelete, className }: FileItemProps): JSX.Element => {
  const handleDelete = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(file);
  };

  const handlePreview = (): void => {
    if (file.previewUrl) {
      window.open(file.previewUrl, '_blank');
    }
  };

  return (
    <div
      className={cn(
        'bg-background/50 my-2 flex items-center justify-between rounded-md border p-2 transition-all',
        file.isUploading ? 'border-primary/30' : 'border-border',
        className,
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
          {file.isUploading ? (
            <Loader2Icon className="text-primary size-4 animate-spin" />
          ) : (
            <FileIcon className="text-foreground/70 size-4" />
          )}
        </div>
        <div className="truncate text-sm">{file.path}</div>
      </div>

      <div className="flex items-center gap-2">
        {file.isUploading ? (
          <div className="text-muted-foreground text-xs">Envoi...</div>
        ) : (
          <div className="cursor-default rounded-full p-1.5 transition-colors hover:bg-green-500/10">
            <CheckCircle2Icon className="size-4 text-green-500" />
          </div>
        )}

        {file.previewUrl && (
          <div
            className="text-primary/70 hover:bg-primary/10 hover:text-primary cursor-pointer rounded-full p-1.5 transition-colors"
            onClick={handlePreview}
            aria-label="Prévisualiser le fichier"
          >
            <EyeIcon className="size-4" />
          </div>
        )}

        {!file.isUploading && (
          <div
            className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-full p-1.5 transition-colors"
            onClick={handleDelete}
            aria-label="Supprimer le fichier"
          >
            <TrashIcon className="size-4" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Component to display the dropzone placeholder
 */
const Placeholder = ({
  custom,
  isVisible,
  isDragActive,
}: PlaceholderProps): JSX.Element | null => {
  if (!isVisible) return null;

  if (custom) return <>{custom}</>;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-6 text-center transition-all',
        isDragActive ? 'scale-110' : 'scale-100',
      )}
    >
      <div
        className={cn(
          'rounded-full p-3 transition-colors',
          isDragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        <CloudUploadIcon className={cn('size-6', isDragActive && 'animate-bounce')} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isDragActive ? 'Déposez les fichiers ici' : 'Glissez et déposez des fichiers'}
        </p>
        <p className="text-muted-foreground text-xs">
          ou <span className="text-primary underline">parcourir</span>
        </p>
      </div>
    </div>
  );
};

/**
 * GhostDropzone component for file uploads
 * @param accept - Accepted file types that can be selected in the file dialog
 * @param uploadUrl - The endpoint's url to upload the file to the server
 * @param maxFiles - Maximum number of files that can be uploaded at same time
 * @param errorMessage - The error message to display in case of an error
 * @param onChange
 * @param value
 * @param classNames
 * @param components
 */
const GhostDropzone = ({
  uploadUrl,
  maxFiles = 1,
  accept,
  errorMessage,
  onChange,
  value,
  classNames,
  components,
}: GhostDropzoneProps) => {
  const [currentFiles, setCurrentFiles] = useState<GhostDropzoneFile[]>([]);
  const hasPropagedInitialFiles = useRef(false);
  const onChangeRef = useRef(onChange);

  // ----------------
  // Effects
  // ----------------

  // Propagate initial files to the state
  useEffect(() => {
    if (value && value.length > 0 && !hasPropagedInitialFiles.current) {
      hasPropagedInitialFiles.current = true;
      setCurrentFiles(value);
    }
  }, [value]);

  // Update the file ids on the input's value when the files change
  useEffect(() => {
    if (currentFiles) {
      onChangeRef.current(currentFiles.filter((f) => f.id !== undefined));
    }
  }, [currentFiles]);

  // ----------------
  // Handlers
  // ----------------

  // Handle file deletion
  const handleFileDelete = useCallback((fileToDelete: GhostDropzoneFile): void => {
    setCurrentFiles((prevFiles) => prevFiles.filter((f) => f !== fileToDelete));
  }, []);

  // Handle new file drop
  const handleFileDrop = useCallback(
    (acceptedFiles: File[]): void => {
      // Skip propagation of initial files to prevent infinite loop when we set new files
      hasPropagedInitialFiles.current = true;

      acceptedFiles.forEach((file) => {
        const tempId = uuidv4();

        setCurrentFiles((prevFiles) => [
          ...prevFiles,
          {
            id: tempId,
            isUploading: true,
            path: file.name,
          },
        ]);

        wolfios
          .postForm(uploadUrl, {
            file: file,
          })
          .then((res) => res.data)
          .then((data) => {
            setCurrentFiles((prevFiles) =>
              prevFiles.map((prevFile) => {
                if (prevFile.id === tempId) {
                  return {
                    ...prevFile,
                    id: data.id,
                    previewUrl: data.presignedUrl ?? undefined,
                    isUploading: false,
                  };
                }

                return prevFile;
              }),
            );
          })
          .catch((err) => {
            // Handle file rejected error (server side)
            if (err.response?.data?.message) {
              toast.error(err.response?.data?.message);
            } else if (err.response?.status === 413) {
              // 413 = Payload Too Large
              toast.error(ERROR_MESSAGES.FILE_TOO_LARGE);
            } else {
              toast.error(ERROR_MESSAGES.UPLOAD_FAILED);
            }

            // Remove the file that has problem from the list
            setCurrentFiles((prevFiles) => prevFiles.filter((f) => f.id !== tempId));
          });
      });
    },
    [uploadUrl],
  );

  // Handle file rejected errors (client side)
  const handleFileRejection = useCallback(
    (fileRejection: FileRejection[], event: DropEvent): void => {
      // Handle sent more files than maxFiles allowed error
      if (fileRejection.length > maxFiles) {
        toast.error(ERROR_MESSAGES.MAX_FILES_EXCEEDED(maxFiles));
        return;
      }

      // Handle dropzone specific errors
      fileRejection.forEach((rejection) => {
        const errorCode = rejection.errors[0].code;
        const errorMessage = rejection.errors[0].message;

        switch (errorCode) {
          case 'file-invalid-type':
            toast.error(ERROR_MESSAGES.INVALID_TYPE(errorMessage));
            break;
          case 'file-too-large':
            toast.error(ERROR_MESSAGES.FILE_TOO_LARGE_DETAIL(errorMessage));
            break;
          default:
            toast.error(ERROR_MESSAGES.DEFAULT_REJECTION(errorMessage));
            break;
        }
      });
    },
    [maxFiles],
  );

  // ----------------
  // Dropzone setup
  // ----------------
  const canAddMoreFiles = currentFiles.length < maxFiles;
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    onDropRejected: handleFileRejection,
    accept,
    multiple: maxFiles > 1,
    maxFiles,
    noClick: !canAddMoreFiles,
    noKeyboard: !canAddMoreFiles,
    noDrag: !canAddMoreFiles,
  });

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'bg-background relative h-full w-full overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200',
          classNames?.container,
          errorMessage && 'border-destructive bg-destructive/5',
          canAddMoreFiles
            ? 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
            : 'cursor-default',
          canAddMoreFiles && isDragActive && 'border-primary bg-primary/10 shadow-sm',
        )}
        {...getRootProps()}
      >
        {/* Input is mandatory for mobile devices */}
        <input {...getInputProps()} />

        {/* Placeholder component */}
        <Placeholder
          custom={components?.placeholder}
          isVisible={canAddMoreFiles}
          isDragActive={isDragActive}
        />

        {/* File list */}
        <div className={cn('px-4 py-2', currentFiles.length > 0 && 'border-t')}>
          {currentFiles.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={handleFileDelete}
              className={classNames?.file}
            />
          ))}
        </div>
      </div>

      {/* Display error message */}
      {errorMessage && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircleIcon className="h-4 w-4" />
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

GhostDropzone.displayName = 'GhostDropzone';

export { GhostDropzone };
