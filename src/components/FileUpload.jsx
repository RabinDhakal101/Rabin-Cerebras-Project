import { useRef } from "react";
import { Upload } from "lucide-react";

export default function FileUpload({ onFilesSelected, isLoading }) {
  const fileInputRef = useRef(null);

  function openFilePicker() {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleChange(event) {
    const selectedFiles = Array.from(event.target.files || []);

    const excelFiles = selectedFiles.filter(
      (file) =>
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls")
    );

    onFilesSelected(excelFiles);

    event.target.value = "";
  }

  return (
    <div className="upload-card">
      <button
        type="button"
        className="upload-icon"
        onClick={openFilePicker}
        disabled={isLoading}
        aria-label="Upload Excel files"
      >
        <Upload size={32} />
      </button>

      <div>
        <h2>Upload performance sweeps</h2>
        <p>
          Upload one or many Excel files. The app will parse them live and
          compare models/profile sweeps side by side.
        </p>
      </div>

      <button
        type="button"
        className="upload-button"
        onClick={openFilePicker}
        disabled={isLoading}
      >
        {isLoading ? "Parsing files..." : "Choose Excel files"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}