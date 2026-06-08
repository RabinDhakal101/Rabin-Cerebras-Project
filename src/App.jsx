import { useMemo, useState } from "react";
import CustomerView from "./components/CustomerView";
import FileUpload from "./components/FileUpload";
import { parseExcelFiles } from "./utils/excelParser";
import { groupRowsByModelProfile, formatNumber } from "./utils/metrics";
import { rankGroups, DEFAULT_TARGETS } from "./utils/verdictRules";
import "./index.css";

function App() {
  const [rows, setRows] = useState([]);
  const [fileSummaries, setFileSummaries] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const groups = useMemo(() => {
    const grouped = groupRowsByModelProfile(rows);
    return rankGroups(grouped, DEFAULT_TARGETS);
  }, [rows]);

  async function handleFilesSelected(files) {
    if (!files.length) {
      setErrors([
        {
          fileName: "Upload",
          message: "Please select at least one Excel file.",
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const result = await parseExcelFiles(files);

      setRows(result.rows);
      setFileSummaries(result.fileSummaries);
      setErrors(result.errors);
    } catch (error) {
      setErrors([
        {
          fileName: "Upload",
          message: error.message || "Something went wrong while parsing files.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Cerebras performance projection explorer</p>
          <h1>Turn perf sweeps into customer and engineer decisions</h1>
          <p className="hero-copy">
            Upload one or many Excel projection sweeps. The app detects model and
            profile names, calculates useful metrics, and gives a first-pass
            Go/Risky/No-Go decision.
          </p>
        </div>
      </section>

      <FileUpload onFilesSelected={handleFilesSelected} isLoading={isLoading} />

      {errors.length > 0 && (
        <section className="panel error-panel">
          <h2>Upload notes</h2>
          {errors.map((error, index) => (
            <p key={`${error.fileName}-${index}`}>
              <strong>{error.fileName}:</strong> {error.message}
            </p>
          ))}
        </section>
      )}

      {fileSummaries.length > 0 && (
        <section className="summary-grid">
          <div className="summary-card">
            <span>Files uploaded</span>
            <strong>{fileSummaries.length}</strong>
          </div>
          <div className="summary-card">
            <span>Rows parsed</span>
            <strong>{rows.length}</strong>
          </div>
          <div className="summary-card">
            <span>Model/profile sweeps</span>
            <strong>{groups.length}</strong>
          </div>
        </section>
      )}

      {groups.length > 0 ? (
        <>
       
        <CustomerView groups={groups} />
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Model/profile summary</h2>
              <p>
                This is the first working view. Next we will split this into
                Customer View, Comparison View, and Engineer View.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Profile</th>
                  <th>Rows</th>
                  <th>Avg throughput</th>
                  <th>Avg gen speed</th>
                  <th>Avg TTFT</th>
                  <th>Avg latency</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.key}>
                    <td>{group.model}</td>
                    <td>{group.profile}</td>
                    <td>{group.metrics?.rowCount ?? 0}</td>
                    <td>{formatNumber(group.metrics?.avgThroughput)}</td>
                    <td>{formatNumber(group.metrics?.avgOutputTokSec)}</td>
                    <td>{formatNumber(group.metrics?.avgTTFT)}</td>
                    <td>{formatNumber(group.metrics?.avgLatency)}</td>
                    <td>
                      <span className={`badge ${group.verdict.severity}`}>
                        {group.verdict.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
         </>
      ) : (
        <section className="empty-state">
          <h2>No sweeps uploaded yet</h2>
          <p>
            Upload one Excel file to get a single model/profile verdict, or
            upload many files to compare models side by side.
          </p>
        </section>
      )}
    </main>
  );
}

export default App;