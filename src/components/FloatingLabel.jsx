import { useState, useRef, useEffect } from "react";

export default function FloatingLabel({
  label,
  required = false,
  children,
  className = "",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if input/select/textarea has a value
    const input = containerRef.current?.querySelector("input, select, textarea");
    if (input) {
      const checkValue = () => {
        let value = input.value;
        // For selects, check if a non-empty option is selected
        if (input.tagName === "SELECT") {
          const selectedOption = input.options[input.selectedIndex];
          value = selectedOption && selectedOption.value !== "" ? input.value : "";
        }
        setHasValue(value !== "");
      };
      
      checkValue();
      input.addEventListener("input", checkValue);
      input.addEventListener("change", checkValue);
      
      return () => {
        input.removeEventListener("input", checkValue);
        input.removeEventListener("change", checkValue);
      };
    }
  }, []);

  const isFloating = isFocused || hasValue;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFloating
            ? "top-2 text-xs text-indigo-400"
            : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
        }`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    </div>
  );
}
