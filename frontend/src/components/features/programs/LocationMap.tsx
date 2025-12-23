"use client";

import React from "react";
import { MapPin } from "lucide-react";

type LocationMapProps = {
  location?: string;
  latitude?: number;
  longitude?: number;
  height?: string;
  placeName?: string;
  showRoute?: boolean;
  userLocation?: { lat: number; lng: number } | null;
};

export function LocationMap({
  location,
  latitude,
  longitude,
  height = "h-64",
  placeName,
  showRoute = false,
}: LocationMapProps) {
  // Build Google Maps link
  const directionsLink =
    latitude && longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(location || placeName || "Philippines")}`;

  // Build embeddable map URL (no API key needed)
  const mapEmbedUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
    : location || placeName
      ? `https://www.google.com/maps?q=${encodeURIComponent(location || placeName || "Philippines")}&z=15&output=embed`
      : null;

  return (
    <div className={`relative w-full ${height} rounded-lg overflow-hidden border-2 border-[#004225]/20 bg-gradient-to-br from-background to-gray-100`}>
      {mapEmbedUrl ? (
        <iframe
          title={placeName || location || "Program map"}
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#004225]/5 to-[#FFB000]/5">
          <MapPin className="w-16 h-16 text-[#FFB000] mb-3" />
          <p className="text-[#004225] font-semibold">{placeName || "Program Location"}</p>
          {location && <p className="text-gray-600 text-sm mt-1 text-center px-4">{location}</p>}
          {latitude && longitude && (
            <p className="text-xs text-gray-500 mt-2">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          )}
        </div>
      )}

      {/* Overlay with location info and button */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4">
        <div className="text-white mb-3">
          {placeName && <p className="font-bold text-lg drop-shadow-lg">{placeName}</p>}
          {location && <p className="text-sm drop-shadow-lg opacity-90 line-clamp-2">{location}</p>}
          {latitude && longitude && (
            <p className="text-xs opacity-80 mt-1">
              📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        <a
          href={directionsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 rounded-lg bg-[#FFB000] text-[#004225] font-bold text-center hover:bg-yellow-500 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          {showRoute ? "Get Directions" : "View in Google Maps"}
        </a>
      </div>
    </div>
  );
}
