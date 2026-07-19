import { useState } from "react";
import { getImageUrl } from "@/lib/utils";

const PLACEHOLDER = "https://placehold.co/400x400?text=No+Image&font=roboto";

export default function ProductImage({ src, alt, className = "" }) {
  const resolved = getImageUrl(src);
  const [imgSrc, setImgSrc] = useState(resolved || PLACEHOLDER);
  const [triedFallback, setTriedFallback] = useState(false);

  return (
    <img
      src={imgSrc}
      alt={alt || "Product"}
      className={className}
      loading="lazy"
      onError={() => {
        if (!triedFallback) {
          setTriedFallback(true);
          setImgSrc(PLACEHOLDER);
        }
      }}
    />
  );
}
