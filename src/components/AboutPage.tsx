"use client"

import type { AppState } from "../App"

interface AboutPageProps {
  navigateTo: (state: AppState) => void
}

const AboutPage = ({ navigateTo }: AboutPageProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="hash-display flex-1 flex flex-col p-6 rounded-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mb-4">
            <i className="ri-fingerprint-line text-white text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">HashMaker</h2>
          <p className="text-gray-400">V3.0</p>
        </div>

        <div className="mt-8 text-center">
          <button
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-button flex items-center mx-auto whitespace-nowrap transition-colors"
            onClick={() => navigateTo("landing")}
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to App
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

export default AboutPage
