interface Props {
  title: string;
  subtitle?: string | null;
  onBack: () => void;
  onClose: () => void;
}

export function SubPageHeader({ title, subtitle = null, onBack, onClose }: Props) {
  return (
    <div className="bg-white border-b relative">
      <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-900 text-xl cursor-pointer">✕</button>
      <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-600 hover:text-gray-900 cursor-pointer text-sm sm:text-base">← Back</button>
      <div className="px-3 sm:px-4 py-4 sm:py-6 text-center">
        <h1 className="text-lg sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-0">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1 text-sm sm:text-base">{subtitle}</p>}
      </div>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

export function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div
      className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${checked ? "bg-green-700" : "bg-gray-300"} relative flex-shrink-0`}
      onClick={onChange}
    >
      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
    </div>
  );
}
