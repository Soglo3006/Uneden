"use client";

import { useEffect } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { useJsApiLoader, type Libraries } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

const LIBRARIES: Libraries = ["places"];

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

function PlacesInput({ value, onChange, placeholder, id, required }: Props) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    defaultValue: value,
    debounce: 300,
    requestOptions: { types: ["(cities)"] },
  });

  useEffect(() => {
    setValue(value, false);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          id={id}
          value={inputValue}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          disabled={!ready}
          placeholder={placeholder}
          required={required}
          className="h-12 pl-9"
          autoComplete="off"
        />
      </div>
      {status === "OK" && data.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="flex items-center gap-2 px-4 py-3 hover:bg-green-50 cursor-pointer text-sm text-gray-700"
              onMouseDown={(e) => {
                e.preventDefault();
                setValue(description, false);
                onChange(description);
                clearSuggestions();
              }}
            >
              <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LocationAutocomplete(props: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  if (!isLoaded) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          id={props.id}
          required={props.required}
          className="h-12 pl-9"
          disabled
        />
      </div>
    );
  }

  return <PlacesInput {...props} />;
}
