"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function RepairImageUploader({
  existingImages,
  repairRecordId,
}: RepairImageUploaderProps) {
  const router = useRouter();
  const [imageType, setImageType] = useState("before");
  const [captionZh, setCaptionZh] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  async function uploadImages() {
    if (!files || files.length === 0) {
      setErrorMessage("请选择图片。");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    for (const file of Array.from(files)) {
      const extension = file.name.split(".").at(-1) ?? "jpg";
      const storagePath = `${repairRecordId}/${imageType}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("repair-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setErrorMessage(uploadError.message);
        setIsUploading(false);
        return;
      }

      const { error: metadataError } = await supabase
        .from("repair_images")
        .insert({
          repair_record_id: repairRecordId,
          image_type: imageType,
          storage_path: storagePath,
          caption_zh: captionZh.trim() || null,
          caption_en: captionEn.trim() || null,
          sort_order: existingImages.length,
        });

      if (metadataError) {
        setErrorMessage(metadataError.message);
        setIsUploading(false);
        return;
      }
    }

    setFiles(null);
    setCaptionZh("");
    setCaptionEn("");
    setIsUploading(false);
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

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-md border p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="image_type">图片类型</Label>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              id="image_type"
              onChange={(event) => setImageType(event.target.value)}
              value={imageType}
            >
              <option value="before">维修前</option>
              <option value="after">维修后</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="caption_zh">中文说明</Label>
            <Input
              id="caption_zh"
              onChange={(event) => setCaptionZh(event.target.value)}
              value={captionZh}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="caption_en">English Caption</Label>
            <Input
              id="caption_en"
              onChange={(event) => setCaptionEn(event.target.value)}
              value={captionEn}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="repair_images">选择图片</Label>
          <Input
            accept="image/*"
            id="repair_images"
            multiple
            onChange={(event) => setFiles(event.target.files)}
            type="file"
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <div>
          <Button disabled={isUploading} onClick={uploadImages} type="button">
            {isUploading ? "上传中..." : "上传图片"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {existingImages.map((image) => (
          <div
            className="grid gap-3 rounded-md border p-3"
            key={image.id}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={image.caption_en || image.caption_zh || "Repair image"}
              className="aspect-square w-full rounded-md object-cover"
              src={getPublicUrl(image.storage_path)}
            />
            <div className="grid gap-1 text-sm">
              <div className="font-medium">
                {IMAGE_TYPE_LABELS[image.image_type] ?? image.image_type}
              </div>
              <div className="text-muted-foreground">
                {image.caption_zh || image.caption_en || "无说明"}
              </div>
            </div>
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

      {existingImages.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          暂无图片。
        </div>
      ) : null}
    </div>
  );
}
