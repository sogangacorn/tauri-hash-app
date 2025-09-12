"use client"

import type { AppState, HashReport } from "../App"

interface HashAttachedProps {
  hashReport: HashReport
  compareHashReport: HashReport
  onClearHash: () => void
  onClearCompareHash: () => void
  onCompare: () => void
  navigateTo: (state: AppState) => void
}

const HashAttached = ({
  hashReport,
  compareHashReport,
  onClearHash,
  onClearCompareHash,
  onCompare,
  navigateTo,
}: HashAttachedProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="hash-display flex-1 flex flex-col p-5 rounded-lg min-h-[150px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-file-text-line text-primary text-2xl"></i>
              <span className="text-gray-300 text-lg font-medium">Hash report attached</span>
            </div>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-button text-sm flex items-center whitespace-nowrap transition-colors"
              onClick={onClearHash}
            >
              <i className="ri-close-line mr-1"></i>
              Clear
            </button>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Path:</p>
            <p className="text-sm text-gray-300 truncate">{hashReport.path}</p>
          </div>

          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Hash:</p>
            <p className="text-sm text-primary font-mono truncate">{hashReport.hash}</p>
          </div>
        </div>

        <div className="hash-display flex-1 flex flex-col p-5 rounded-lg min-h-[150px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-folder-line text-primary text-2xl"></i>
              <span className="text-gray-300 text-lg font-medium">Folder attached</span>
            </div>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-button text-sm flex items-center whitespace-nowrap transition-colors"
              onClick={onClearCompareHash}
            >
              <i className="ri-close-line mr-1"></i>
              Clear
            </button>
          </div>

          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Path:</p>
            <p className="text-sm text-gray-300 truncate">{compareHashReport.path}</p>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-button flex items-center whitespace-nowrap transition-colors"
            onClick={onCompare}
          >
            <i className="ri-refresh-line mr-2"></i>
            Compare
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

export default HashAttached
