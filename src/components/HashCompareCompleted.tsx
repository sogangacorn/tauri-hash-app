"use client"

import type { AppState } from "../App"

interface HashCompareCompletedProps {
  result: "identical" | "mismatch"
  navigateTo: (state: AppState) => void
}

const HashCompareCompleted = ({ result, navigateTo }: HashCompareCompletedProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="hash-display flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-3 text-green-500 mb-4">
            <i className="ri-checkbox-circle-line ri-3x"></i>
            <span className="text-base font-bold whitespace-nowrap">Hash compared completely</span>
          </div>
          <h3 className="text-white text-lg mb-4">Comparison Result:</h3>

          {result === "identical" ? (
            <p className="text-green-500 text-xl font-bold">Identical Configuration</p>
          ) : (
            <p className="text-red-500 text-xl font-bold">Configuration Mismatch</p>
          )}
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-button flex items-center whitespace-nowrap transition-colors"
            onClick={() => navigateTo("compare-hash")}
          >
            <i className="ri-refresh-line mr-2"></i>
            New Comparison
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

export default HashCompareCompleted
