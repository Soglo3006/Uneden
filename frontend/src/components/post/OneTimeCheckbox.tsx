"use client";

interface Props {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function OneTimeCheckbox({ id, checked, onChange }: Props) {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="text-sm font-medium text-amber-800">One-time listing</span>
        <p className="text-xs text-amber-700 mt-0.5">
          Once a request is accepted, this listing will be hidden and all other pending requests will be automatically declined.
        </p>
      </label>
    </div>
  );
}
