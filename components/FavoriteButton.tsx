"use client";

import { useEffect, useState } from "react";

export default function FavoriteButton({
  bikeId,
}: {
  bikeId: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(
      localStorage.getItem("favoriteBikes") ?? "[]"
    ) as string[];

    setSaved(favorites.includes(bikeId));
  }, [bikeId]);

  function toggleFavorite() {
    const favorites = JSON.parse(
      localStorage.getItem("favoriteBikes") ?? "[]"
    ) as string[];

    if (favorites.includes(bikeId)) {
      const updated = favorites.filter(
        (id) => id !== bikeId
      );

      localStorage.setItem(
        "favoriteBikes",
        JSON.stringify(updated)
      );

      setSaved(false);
    } else {
      const updated = [...favorites, bikeId];

      localStorage.setItem(
        "favoriteBikes",
        JSON.stringify(updated)
      );

      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      className={`rounded-xl border px-4 py-3 font-semibold transition ${
        saved
          ? "border-orange-500 bg-orange-500/10 text-orange-400"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
      }`}
    >
      {saved ? "♥ Saved" : "♡ Save Bike"}
    </button>
  );
}