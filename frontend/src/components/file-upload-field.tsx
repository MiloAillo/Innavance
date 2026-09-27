import { useCallback, useState } from "react";
import { Upload, X, FileImage } from "lucide-react";

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  maxSizeMB?: number;
}

export function FileUploadField({
  label,
  required = false,
  value,
  onChange,
  error,
  maxSizeMB = 5,
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, and PNG files are allowed";
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const error = validateFile(file);
        if (!error) {
          onChange(file);
        }
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (!error) {
        onChange(file);
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? "border-green-500 bg-green-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-neutral-300 bg-neutral-50 hover:border-green-400 hover:bg-green-50"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="text-neutral-400" size={32} />
            <p className="text-sm font-semibold text-neutral-700">
              Drop file or click to upload
            </p>
            <p className="text-xs text-neutral-500">
              JPG, PNG up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-white p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
            <FileImage className="text-green-600" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-800 truncate">
              {value.name}
            </p>
            <p className="text-xs text-neutral-500">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
