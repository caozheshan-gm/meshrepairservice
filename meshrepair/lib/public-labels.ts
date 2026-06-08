const PRODUCT_TYPE_LABELS: Record<string, string> = {
  衣服: "Garment",
  前长后短衣服: "High-low Garment",
  手套: "Glove",
  围裙: "Apron",
  分腿裤: "Split-leg Pants",
};

const MATERIAL_LABELS: Record<string, string> = {
  不锈钢: "Stainless Steel",
  钛丝: "Titanium Wire",
};

export function publicProductTypeLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return PRODUCT_TYPE_LABELS[value] ?? value;
}

export function publicMaterialLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return MATERIAL_LABELS[value] ?? value;
}
