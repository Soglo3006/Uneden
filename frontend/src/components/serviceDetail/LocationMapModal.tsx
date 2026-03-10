"use client";

import { useTranslation } from "react-i18next";

interface Props {
  location: string;
  onClose: () => void;
}

export default function LocationMapModal({ location, onClose }: Props) {
  const { t } = useTranslation();
  const mapQuery = encodeURIComponent(location);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">{t("serviceDetail.approximateLocation")}</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            aria-label="Close map"
          >
            ✕
          </button>
        </div>
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            title="Location Map"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed&z=12`}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-green-600 bg-green-500/10 shadow-lg" />
          </div>
        </div>
        <div className="px-4 py-3 text-xs text-gray-600 flex items-center justify-between border-t">
          <span>{t("serviceDetail.approximateLocationDesc")}</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-green-700 hover:text-green-800"
          >
            {t("serviceDetail.openInGoogleMaps")}
          </a>
        </div>
      </div>
    </div>
  );
}
