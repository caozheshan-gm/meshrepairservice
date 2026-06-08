"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BlockingOverlay } from "@/components/ui/blocking-overlay";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type RepairImage = {
  caption_en: string | null;
  caption_zh: string | null;
  id: string;
  image_type: string;
  sort_order: number;
  storage_path: string;
};

type RepairImageUploaderProps = {
  existingImages: RepairImage[];
  repairRecordId: string;
};

const IMAGE_TYPE_LABELS: Record<string, string> = {
  before: "维修前",
  after: "维修后",
  other: "其他",
};

const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.82;

export function RepairImageUploader({
  existingImages,
  repairRecordId,
}: RepairImageUploaderProps) {
  const router = useRouter();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  async function uploadImages(imageType: "before" | "after", files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setUploadingType(imageType);
    setErrorMessage(null);

    const existingTypeImages = existingImages.filter(
      (image) => image.image_type === imageType,
    );

    for (const [index, file] of Array.from(files).entries()) {
      const compressedFile = await compressImage(file);
      const storagePath = `${repairRecordId}/${imageType}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("repair-images")
        .upload(storagePath, compressedFile, {
          contentType: compressedFile.type,
          upsert: false,
        });

      if (uploadError) {
        setErrorMessage(uploadError.message);
        setUploadingType(null);
        return;
      }

      const { error: metadataError } = await supabase
        .from("repair_images")
        .insert({
          repair_record_id: repairRecordId,
          image_type: imageType,
          storage_path: storagePath,
          caption_zh: null,
          caption_en: null,
          sort_order: existingTypeImages.length + index,
        });

      if (metadataError) {
        setErrorMessage(metadataError.message);
        setUploadingType(null);
        return;
      }
    }

    setUploadingType(null);
    router.refresh();
  }

  function getPublicUrl(storagePath: string) {
    return supabase.storage.from("repair-images").getPublicUrl(storagePath).data
      .publicUrl;
  }

  async function deleteImage(image: RepairImage) {
    const confirmed = window.confirm("确定删除这张图片吗？此操作不可撤销。");

    if (!confirmed) {
      return;
    }

    setDeletingImageId(image.id);
    setErrorMessage(null);

    const { error: storageError } = await supabase.storage
      .from("repair-images")
      .remove([image.storage_path]);

    if (storageError) {
      setErrorMessage(storageError.message);
      setDeletingImageId(null);
      return;
    }

    const { error: metadataError } = await supabase
      .from("repair_images")
      .delete()
      .eq("id", image.id);

    if (metadataError) {
      setErrorMessage(metadataError.message);
      setDeletingImageId(null);
      return;
    }

    setDeletingImageId(null);
    router.refresh();
  }

  const beforeImages = existingImages.filter(
    (image) => image.image_type === "before",
  );
  const afterImages = existingImages.filter(
    (image) => image.image_type === "after",
  );
  const isBusy = Boolean(uploadingType || deletingImageId);
  const busyMessage = uploadingType ? "图片上传中..." : "图片删除中...";

  return (
    <div className="grid gap-6">
      <BlockingOverlay message={busyMessage} open={isBusy} />

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ImageColumn
          deleteImage={deleteImage}
          deletingImageId={deletingImageId}
          getPublicUrl={getPublicUrl}
          images={beforeImages}
          isUploading={uploadingType === "before"}
          onUpload={(files) => uploadImages("before", files)}
          title="维修前"
        />
        <ImageColumn
          deleteImage={deleteImage}
          deletingImageId={deletingImageId}
          getPublicUrl={getPublicUrl}
          images={afterImages}
          isUploading={uploadingType === "after"}
          onUpload={(files) => uploadImages("after", files)}
          title="维修后"
        />
      </div>

      {existingImages.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          暂无图片。
        </div>
      ) : null}
    </div>
  );
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    if (!blob) {
      return file;
    }

    return new File([blob], replaceExtension(file.name), {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    image.src = url;
  });
}

function replaceExtension(fileName: string) {
  return `${fileName.replace(/\.[^.]+$/, "")}.jpg`;
}

function ImageColumn({
  deleteImage,
  deletingImageId,
  getPublicUrl,
  images,
  isUploading,
  onUpload,
  title,
}: {
  deleteImage: (image: RepairImage) => void;
  deletingImageId: string | null;
  getPublicUrl: (storagePath: string) => string;
  images: RepairImage[];
  isUploading: boolean;
  onUpload: (files: FileList | null) => void;
  title: string;
}) {
  const inputId = `repair-images-${title}`;

  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <label
        className="grid min-h-40 cursor-pointer place-items-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40"
        htmlFor={inputId}
      >
        <input
          accept="image/*"
          className="sr-only"
          id={inputId}
          multiple
          onChange={(event) => {
            onUpload(event.target.files);
            event.target.value = "";
          }}
          type="file"
        />
        <span className="text-3xl leading-none">+</span>
        <span>{isUploading ? "上传中..." : `添加${title}图片`}</span>
      </label>

      <div className="grid gap-3">
        {images.map((image) => (
          <div className="grid gap-3 rounded-md border p-3" key={image.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={IMAGE_TYPE_LABELS[image.image_type] ?? title}
              className="aspect-square w-full rounded-md object-cover"
              src={getPublicUrl(image.storage_path)}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild type="button" variant="outline">
                <a
                  href={getPublicUrl(image.storage_path)}
                  rel="noreferrer"
                  target="_blank"
                >
                  打开原图
                </a>
              </Button>
              <Button
                disabled={deletingImageId === image.id}
                onClick={() => deleteImage(image)}
                type="button"
                variant="destructive"
              >
                {deletingImageId === image.id ? "删除中..." : "删除"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
