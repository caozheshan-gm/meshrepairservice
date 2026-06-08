"use client";

import { QRCodeSVG } from "qrcode.react";

export function ProductQrCode({ value }: { value: string }) {
  return (
    <QRCodeSVG
      className="h-full w-full"
      includeMargin
      level="M"
      value={value}
    />
  );
}
