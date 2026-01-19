"use client";
import { useState, useCallback } from "react";
import { useSupabase } from "@/shared/context/supabase-context";

type UploadOptions = {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
};

type UploadResult = {
  url: string;
  path: string;
};

export const useUploadImageToStorage = (options: UploadOptions) => {
  const { supabase } = useSupabase();
  const {
    bucket,
    folder = "",
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  } = options;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `El archivo es muy grande. Tamaño máximo: ${maxSizeMB}MB`;
      }

      return null;
    },
    [allowedTypes, maxSizeMB]
  );

  const generateFileName = useCallback((file: File): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split(".").pop();
    return `${timestamp}-${randomString}.${extension}`;
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setError(null);
      setProgress(0);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return null;
      }

      try {
        setUploading(true);
        setProgress(10);

        const fileName = generateFileName(file);
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        setProgress(30);

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        setProgress(80);

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        setProgress(100);

        return {
          url: urlData.publicUrl,
          path: data.path,
        };
      } catch (err: any) {
        console.error("Error uploading image:", err);
        setError(err.message || "Error al subir imagen");
        return null;
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, validateFile, generateFileName, supabase]
  );

  const deleteImage = useCallback(
    async (path: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([path]);

        if (deleteError) {
          throw deleteError;
        }

        return true;
      } catch (err: any) {
        console.error("Error deleting image:", err);
        setError(err.message || "Error al eliminar imagen");
        return false;
      }
    },
    [bucket, supabase]
  );

  const replaceImage = useCallback(
    async (newFile: File, oldPath?: string): Promise<UploadResult | null> => {
      if (oldPath) {
        await deleteImage(oldPath);
      }
      return uploadImage(newFile);
    },
    [uploadImage, deleteImage]
  );

  return {
    uploadImage,
    deleteImage,
    replaceImage,
    uploading,
    error,
    progress,
    setError,
  };
};
