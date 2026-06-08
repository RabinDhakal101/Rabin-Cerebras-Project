import { Upload } from "lucide-react";

export default function FileUpload({ onFilesSelected, isLoading }) {
  function handleChange(event) {
    const selectedFiles = Array.from(event.target.files || []);

    const excelFiles = selectedFiles.filter((file) =>
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls")
    );

    onFilesSelected(excelFiles);

    event.target.value = "";
  }

  return (
    <div className="upload-card">
      <div className="upload-icon">
        <Upload size={32} />
      </div>

      <div>
        <h2>Upload performance sweeps</h2>
        <p>
          Upload one or many Excel files. The app will parse them live and compare
          models/profile sweeps side by side.
        </p>
      </div>

      <label className="upload-button">
        {isLoading ? "Parsing files..." : "Choose Excel files"}
        <input
          type="file"
          accept=".xlsx,.xls"
          multiple
          onChange={handleChange}
          disabled={isLoading}
          hidden
        />
      </label>
    </div>
  );
}