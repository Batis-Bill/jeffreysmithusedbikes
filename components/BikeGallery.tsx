"use client";

import { useState } from "react";

type GalleryImage = {
  url: string;
  alt: string;
};

export default function BikeGallery({
  images,
}: {
  images: GalleryImage[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-white/10 bg-slate-900 text-slate-500">
        No images available
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  function previousImage() {
    setSelectedIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function nextImage() {
    setSelectedIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="aspect-[16/10] w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous picture"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-xl font-bold text-white hover:bg-black"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next picture"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 px-4 py-3 text-xl font-bold text-white hover:bg-black"
            >
              ›
            </button>

            <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image.url}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`overflow-hidden rounded-xl border-2 transition ${
                selectedIndex === index
                  ? "border-orange-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}