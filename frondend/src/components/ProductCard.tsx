"use client";

import { useState } from "react";
import { Product } from "../types/message";

interface Props {
  product: Product;
}

// Map of brand keywords → reliable laptop image URLs
const BRAND_IMAGES: { keywords: string[]; url: string }[] = [
  {
    keywords: ["macbook", "apple", "mac"],
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["asus", "rog", "tuf", "zenbook", "vivobook", "flow"],
    url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["hp", "omen", "victus", "pavilion", "envy", "spectre"],
    url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["acer", "predator", "nitro", "helios", "aspire", "swift"],
    url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["dell", "inspiron", "g15", "g16", "alienware", "latitude", "xps", "vostro"],
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["lenovo", "ideapad", "thinkpad", "legion", "yoga"],
    url: "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["msi", "leopard", "katana", "stealth", "raider", "crosshair", "bravo"],
    url: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["samsung", "galaxy book"],
    url: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=80",
  },
  {
    keywords: ["infinix", "inbook"],
    url: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=500&auto=format&fit=crop&q=80",
  },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=500&auto=format&fit=crop&q=80";

function resolveBrandImage(name: string): string {
  const lower = name.toLowerCase();
  for (const brand of BRAND_IMAGES) {
    if (brand.keywords.some((kw) => lower.includes(kw))) {
      return brand.url;
    }
  }
  return FALLBACK_IMAGE;
}

export default function ProductCard({ product }: Props) {
  const p = product.payload;
  const [imgError, setImgError] = useState(false);

  // Try various common Google Sheet column names for images
  const customImage = p.image || p.Image || p["Image URL"] || p["Image Url"] || p.image_url || p.Photo || p.photo;

  // Use the product's own image URL first, fall back to brand match
  const imageUrl = !imgError && customImage ? customImage : resolveBrandImage(p.name || "");

  // Extract authentic catalog purchase URL from Google Sheet/Qdrant payload
  const rawProductUrl = p.link || p.url || p["Product Link"] || p["URL"] || p["Link"] || p["Product Url"];
  const isValidUrl = typeof rawProductUrl === "string" && (rawProductUrl.startsWith("http://") || rawProductUrl.startsWith("https://"));

  return (
    <div className="mb-3 rounded-xl overflow-hidden border border-[#222e35] bg-[#182229] shadow-sm hover:scale-[1.01] transition-transform w-full max-w-full sm:max-w-[340px] flex flex-col justify-between">
      <div>
        {/* Product Image */}
        <img
          src={imageUrl}
          alt={p.name || "Product"}
          className="w-full h-44 object-cover select-none"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Product Name + Price footer */}
        <div className="p-3 bg-[#182229] border-t border-[#222e35]/30">
          <h4
            className="text-[13px] font-medium text-[#e9edef] line-clamp-2 leading-tight"
            title={p.name}
          >
            {p.name}
          </h4>
          {p.price && (
            <p className="text-[13px] text-[#00a884] font-bold mt-1">
              ₹{p.price}
            </p>
          )}
        </div>
      </div>

      {isValidUrl && (
        <div className="px-3 pb-3 pt-0">
          <a
            href={rawProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center bg-[#00a884] hover:bg-[#008f72] text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors shadow-sm"
          >
            View Product
          </a>
        </div>
      )}
    </div>
  );
}