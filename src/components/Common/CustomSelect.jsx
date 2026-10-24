import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Pilih --",
  labelKey = "nama",
  valueKey = "id",
  renderOption,
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tutup dropdown saat klik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cari item yang sedang dipilih untuk ditampilkan di tombol utama
  const selectedItem = options.find(
    (item) =>
      String(item[valueKey]) === String(value) ||
      String(item[labelKey]) === String(value),
  );

  const displayLabel = selectedItem
    ? renderOption
      ? selectedItem[labelKey]
      : selectedItem.kode
        ? `${selectedItem.kode} - ${selectedItem[labelKey]}`
        : selectedItem[labelKey]
    : value || placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-white cursor-pointer disabled:opacity-50"
      >
        <span className="truncate">
          {selectedItem ? displayLabel : placeholder}
        </span>
        <ChevronDown
          className="w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-100 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            {placeholder}
          </button>

          {options.map((item) => {
            const itemValue =
              item[valueKey] !== undefined ? item[valueKey] : item[labelKey];
            const isSelected =
              String(item[valueKey]) === String(value) ||
              String(item[labelKey]) === String(value);

            return (
              <button
                key={item.id || itemValue}
                type="button"
                onClick={() => {
                  onChange(itemValue);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs rounded-lg transition cursor-pointer flex flex-col ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white"
                }`}
              >
                {renderOption ? (
                  renderOption(item)
                ) : (
                  <>
                    <span className="block font-medium truncate">
                      {item.kode
                        ? `${item.kode} - ${item[labelKey]}`
                        : item[labelKey]}
                    </span>
                    {item.stok !== undefined && (
                      <span className="text-[10px] text-slate-500">
                        Stok: {item.stok}
                      </span>
                    )}
                    {item.keterangan && (
                      <span className="text-[10px] text-slate-500">
                        {item.keterangan}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
