"use client"

import { useDropzone } from "../hooks/use-dropzone"
import type { AppState } from "../App"

interface CompareHashProps {
  onSelectFolder: () => void
  onSelectCompareFolder: () => void
  onDropFile: (path: string) => void
  onDropCompareFile: (path: string) => void
  navigateTo: (state: AppState) => void
}

const CompareHash = ({
  onSelectFolder,
  onSelectCompareFolder,
  onDropFile,
  onDropCompareFile,
  navigateTo,
}: CompareHashProps) => {
  const {
    isDragging: isDragging1,
    dropzoneProps: dropzoneProps1,
  } = useDropzone({ onDrop: onDropFile })
  const {
    isDragging: isDragging2,
    dropzoneProps: dropzoneProps2,
  } = useDropzone({ onDrop: onDropCompareFile })

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div
          {...dropzoneProps1}
          className={`drop-zone flex-1 flex flex-row items-center justify-center p-5 rounded-lg cursor-pointer min-h-[150px] space-x-4 ${
            isDragging1 ? "border-primary bg-primary/5" : ""
          }`}
          onClick={onSelectFolder}
        >
          <div className="w-12 h-20 flex items-center justify-center text-gray-500">
            <i className="ri-folder-line ri-3x"></i>
          </div>
          <p className="text-gray-300 text-lg font-medium whitespace-nowrap">Drop Here</p>
          <span className="text-gray-500 whitespace-nowrap">or</span>
          <button
            className="bg-primary text-white px-4 py-2 rounded-button flex items-center whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation()
              onSelectFolder()
            }}
          >
            <i className="ri-folder-open-line mr-2"></i>
            Explore
          </button>
        </div>

        <div
          {...dropzoneProps2}
          className={`drop-zone flex-1 flex flex-row items-center justify-center p-5 rounded-lg cursor-pointer min-h-[150px] space-x-4 ${
            isDragging2 ? "border-primary bg-primary/5" : ""
          }`}
          onClick={onSelectCompareFolder}
        >
          <div className="w-12 h-20 flex items-center justify-center text-gray-500">
            <i className="ri-folder-line ri-3x"></i>
          </div>
          <p className="text-gray-300 text-lg font-medium whitespace-nowrap">Drop Here</p>
          <span className="text-gray-500 whitespace-nowrap">or</span>
          <button
            className="bg-primary text-white px-4 py-2 rounded-button flex items-center whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation()
              onSelectCompareFolder()
            }}
          >
            <i className="ri-folder-open-line mr-2"></i>
            Explore
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

export default CompareHash
