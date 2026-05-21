import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[] | string[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select option", className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isStatusSelect = className.includes("status-select");

  return (
    <div 
      className={`custom-select-container ${className}`} 
      ref={containerRef}
      style={{ 
        position: "relative", 
        width: isStatusSelect ? "auto" : "100%",
        display: isStatusSelect ? "inline-block" : "block"
      }}
    >
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minWidth: isStatusSelect ? "130px" : "auto",
          minHeight: isStatusSelect ? "30px" : "42px",
          padding: isStatusSelect ? "4px 10px" : "10px 14px",
          border: "1px solid #d7d0c1",
          borderRadius: "8px",
          backgroundColor: "#fffdf8",
          color: "#17201b",
          fontSize: isStatusSelect ? "12px" : "14px",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedOption ? selectedOption.label : value || placeholder}
        </span>
        <ChevronDown size={isStatusSelect ? 12 : 14} style={{ marginLeft: "8px", color: "#657169", flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div
          className="custom-select-dropdown"
          style={{
            position: "absolute",
            top: "108%",
            right: 0,
            width: isStatusSelect ? "140px" : "100%",
            zIndex: 1000,
            maxHeight: "220px",
            overflowY: "auto",
            backgroundColor: "#fffdf8",
            border: "1px solid #ddd7ca",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.04)",
            padding: "4px"
          }}
        >
          {formattedOptions.map((opt) => {
            const isActive = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`custom-select-option${isActive ? " active" : ""}`}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: isStatusSelect ? "12px" : "13.5px",
                  color: isActive ? "#17654f" : "#17201b",
                  backgroundColor: isActive ? "rgba(223, 243, 233, 0.5)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                  marginBottom: "2px"
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
