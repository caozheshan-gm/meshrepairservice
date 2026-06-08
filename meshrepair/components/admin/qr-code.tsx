"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function ProductQrCode({
  fileName,
  value,
}: {
  fileName: string;
  value: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function downloadSvg() {
    const svg = containerRef.current?.querySelector("svg");

    if (!svg) {
      return;
    }

    const serializedSvg = new XMLSerializer().serializeToString(svg);
    downloadBlob(
      new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" }),
      `${fileName}.svg`,
    );
  }

  function downloadPng() {
    const svg = containerRef.current?.querySelector("svg");

    if (!svg) {
      return;
    }

    const serializedSvg = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    const svgUrl = URL.createObjectURL(
      new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" }),
    );

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;

      const context = canvas.getContext("2d");
      context?.fillRect(0, 0, canvas.width, canvas.height);
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${fileName}.png`);
        }

        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };

    image.src = svgUrl;
  }

  return (
    <div className="grid gap-3">
      <div ref={containerRef}>
        <QRCodeSVG
          className="h-full w-full"
          includeMargin
          level="M"
          value={value}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button onClick={downloadSvg} type="button" variant="outline">
          下载 SVG
        </Button>
        <Button onClick={downloadPng} type="button" variant="outline">
          下载 PNG
        </Button>
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
