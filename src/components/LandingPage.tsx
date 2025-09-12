"use client"

import type { AppState } from "../App"

interface LandingPageProps {
  onSelectFolder: () => void
  navigateTo: (state: AppState) => void
}

const LandingPage = ({ onSelectFolder, navigateTo }: LandingPageProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div
        className="drop-zone flex-1 flex flex-col items-center justify-center p-10 rounded-lg cursor-pointer min-h-[300px]"
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add("border-primary")
          e.currentTarget.classList.add("bg-primary/5")
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove("border-primary")
          e.currentTarget.classList.remove("bg-primary/5")
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove("border-primary")
          e.currentTarget.classList.remove("bg-primary/5")
          onSelectFolder()
        }}
      >
        <div className="w-20 h-20 flex items-center justify-center text-gray-500 mb-6">
          <i className="ri-folder-line ri-3x"></i>
        </div>
        <p className="text-gray-300 text-lg font-medium mb-2">Drop Here</p>
        <p className="text-gray-500 mb-4">or</p>
        <button
          className="bg-primary text-white px-4 py-2 rounded-button flex items-center whitespace-nowrap"
          onClick={onSelectFolder}
        >
          <i className="ri-folder-open-line mr-2"></i>
          Explore
        </button>
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

export default LandingPage
