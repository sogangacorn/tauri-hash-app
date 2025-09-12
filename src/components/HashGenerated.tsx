"use client"

import type { AppState, HashReport } from "../App"
import type { Settings } from "../types"
import { generateHashListHTML, generateHashReportHTML } from "../types";
import JSZip from "jszip";

interface HashGeneratedProps {
  hashReport: HashReport
  settings: Settings
  onClear: () => void
  navigateTo: (state: AppState) => void
}

const HashGenerated = ({ hashReport, settings, onClear, navigateTo }: HashGeneratedProps) => {
  const handleDownload = async () => {
    const ts = new Date().getTime();

    const listHtml = generateHashListHTML(hashReport, settings);
    const reportHtml = generateHashReportHTML(hashReport, settings);

    // 1) 요약 리포트 JSON
    const summary = {
      hash: hashReport.hash,
      timeTaken: hashReport.timeTaken,
      folderCount: hashReport.folderCount,
      fileCount: hashReport.fileCount,
      path: hashReport.path,
    };
      const blobSummary = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });

      // 2) 파일별 해시 리스트 JSON
      const listData = { fileHashes: hashReport.fileHashes };
      const blobList = new Blob([JSON.stringify(listData, null, 2)], { type: "application/json" });

      // 3) ZIP 생성
      const zip = new JSZip();
      zip.file(`hash-report-${ts}.json`, blobSummary);
      zip.file(`hash-list-${ts}.json`, blobList);
      zip.file(`${settings.testReportNo}_HashList.html`, listHtml);
      zip.file(`${settings.testReportNo}_HashReport.html`, reportHtml);
      const content = await zip.generateAsync({ type: "blob" });

      // 4) ZIP 다운로드 트리거
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hash-results-${ts}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };    

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="hash-display flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3 text-green-500 mb-4">
            <i className="ri-checkbox-circle-line ri-3x"></i>
            <span className="text-base font-bold whitespace-nowrap">Hash generated completely</span>
          </div>
          <h3 className="text-white text-lg mb-2">Generated Total Hash:</h3>
          <p className="hash-text text-lg">{hashReport.hash}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Time Taken:</span>
            <span className="text-white ml-2">{hashReport.timeTaken}</span>
          </div>

          <div className="flex items-center">
            <span className="text-white ml-2">{hashReport.folderCount} Folders /</span>
            <span className="text-white ml-2">{hashReport.fileCount} Files</span>
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-button flex items-center whitespace-nowrap transition-colors"
            onClick={handleDownload}
          >
            <i className="ri-download-line mr-2"></i>
            Download
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-button flex items-center whitespace-nowrap transition-colors"
            onClick={onClear}
          >
            <i className="ri-delete-bin-line mr-2"></i>
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full md:w-56">
        <button
          className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap"
          onClick={() => navigateTo("landing")}
        >
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-file-text-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">Generate Hash</span>
        </button>

        <button
          className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap"
          onClick={() => navigateTo("compare-hash")}
        >
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-refresh-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">Compare Hashes</span>
        </button>

        <button
          className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap"
          onClick={() => navigateTo("about")}
        >
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-information-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">About</span>
        </button>
      </div>
    </div>
  )
}

export default HashGenerated
