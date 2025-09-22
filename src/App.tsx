"use client"

import { useEffect, useState } from "react"
import { open } from "@tauri-apps/plugin-dialog"

import type { HashReport,Settings } from "./types"
import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"
import { getCurrentWindow } from "@tauri-apps/api/window"

declare global {
  interface Window {
    __TAURI__?: object
  }
}

type ProgressPayload = {
  status: string
  processed: number
  total: number
}

import LandingPage from "./components/LandingPage"
import ProcessingState from "./components/ProcessingState"
import HashGenerated from "./components/HashGenerated"
import CompareHash from "./components/CompareHash"
import HashAttached from "./components/HashAttached"
import HashCompareCompleted from "./components/HashCompareCompleted"
import AboutPage from "./components/AboutPage"
import SettingsModal from "./components/SettingsModal"

// Define app states
export type AppState =
  | "landing"
  | "processing"
  | "hash-generated"
  | "compare-hash"
  | "hash-attached"
  | "hash-compare-completed"
  | "about"
  | "error"

function App() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    algorithm: "sha256",
    testReportNo: "",
    productName: "",
    applicantCo: "",
    copyrightCo: "",
    testDate: new Date().toISOString().split("T")[0],
    labName: "",
    testerName: "",
    docFormId: "",
  })

  const [hashReport, setHashReport] = useState<HashReport | null>(null)
  const [compareHashReport, setCompareHashReport] = useState<HashReport | null>(null)
  const [comparisonResult, setComparisonResult] = useState<"identical" | "mismatch" | null>(null)
  const [progressInfo, setProgressInfo] = useState({
    status: "Ready",
    processed: 0,
    total: 0,
    percent: 0,
  })

  useEffect(() => {
    console.log("[progress state]", progressInfo)
  }, [progressInfo])

  useEffect(() => {
    if (typeof window === "undefined" || !window.__TAURI__) {
      console.warn("Tauri context not detected; progress events unavailable")
      return () => {}
    }

    console.log("[progress listener] mounting, tauri detected", Boolean(window.__TAURI__))

    let unlistenRef: UnlistenFn | null = null
    let canceled = false

    const registerListener = async () => {
      try {
        const target = window.__TAURI__ ? await getCurrentWindow() : null
        const handler = (payload: ProgressPayload) => {
          const percent = payload.total > 0
            ? Math.min(100, Math.round((payload.processed / payload.total) * 100))
            : 0
          setProgressInfo({
            status: payload.status,
            processed: payload.processed,
            total: payload.total,
            percent,
          })
        }

        const unlisten = target
          ? await target.listen<ProgressPayload>("hash-progress", (event) => {
              console.log("[hash-progress current window]", event.payload)
              handler(event.payload)
            })
          : await listen<ProgressPayload>("hash-progress", (event) => {
              console.log("[hash-progress global]", event.payload)
              handler(event.payload)
            })
        if (canceled) {
          unlisten()
          return
        }
        unlistenRef = unlisten
        console.log("[hash-progress] listener registered", target ? "window" : "global")
      } catch (error) {
        console.error("Failed to register progress listener", error)
      }
    }

    registerListener()

    return () => {
      canceled = true
      console.log("[progress listener] tearing down")
      if (unlistenRef) {
        unlistenRef()
        unlistenRef = null
      }
    }
  }, [])
  const generateHash = async (path: string) => {
    setAppState("processing")
    setProgressInfo({ status: "Listing files and folders...", processed: 0, total: 0, percent: 0 })
    console.log("[invoke] compute_hash", { path, algorithm: settings.algorithm })

     try {
      // 2) 백엔드 커맨드 호출
          const report: HashReport = await invoke("compute_hash", { path, algorithm: settings.algorithm })
     
          // 3) 리포트로 상태·진행률 업데이트
          setHashReport(report)
          setAppState("hash-generated")
        } catch (error) {
          console.error(error)
          setAppState("error")
          setProgressInfo({ status: "Error", processed: 0, total: 0, percent: 0 })
        }
  }

  const generateCompareHash = async (path: string) => {
    setAppState("processing")
    setProgressInfo({ status: "Listing files and folders...", processed: 0, total: 0, percent: 0 })
    console.log("[invoke] compute_hash (compare)", { path, algorithm: settings.algorithm })

    try {
      const report: HashReport = await invoke("compute_hash", { path, algorithm: settings.algorithm })
      setCompareHashReport(report)
      setAppState("hash-attached")
    } catch (error) {
      console.error(error)
      setAppState("error")
      setProgressInfo({ status: "Error", processed: 0, total: 0, percent: 0 })
    }
  }

  const compareHashes = async () => {
    if (!hashReport || !compareHashReport) return

    setAppState("processing")
    const result = hashReport.hash === compareHashReport.hash ? "identical" : "mismatch"
    setComparisonResult(result)
    setAppState("hash-compare-completed")
    setProgressInfo((prev) => ({ ...prev, status: "Ready" }))
  }

  // Function to handle folder selection
  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Folder",
      })

      if (selected && !Array.isArray(selected)) {
        generateHash(selected)
      }
    } catch (error) {
      console.error("Error selecting folder:", error)
      console.warn("Dialog API is not available in this environment.")
    }
  }

  // Function to handle file drop
  const handleDropFile = (path: string) => {
    generateHash(path)
  }

  // Function to handle compare file drop
  const handleDropCompareFile = (path: string) => {
    generateCompareHash(path)
  }

  // Function to handle folder selection for comparison
  const handleSelectCompareFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Folder to Compare",
      })

      if (selected && !Array.isArray(selected)) {
        generateCompareHash(selected)
      }
    } catch (error) {
      console.error("Error selecting folder:", error)
      console.warn("Dialog API is not available in this environment.")
    }
  }

  // Function to clear hash report
  const clearHashReport = () => {
    setHashReport(null)
    setAppState("landing")
  }

  // Function to clear compare hash report
  const clearCompareHashReport = () => {
    setCompareHashReport(null)
    setAppState("compare-hash")
  }

  // Function to navigate to different screens
  const navigateTo = (state: AppState) => {
    setAppState(state)
  }

  // Function to toggle settings modal
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  // Render the appropriate component based on app state
  const renderContent = () => {
    switch (appState) {
      case "landing":
        return (
          <LandingPage
            onSelectFolder={handleSelectFolder}
            onDropFile={handleDropFile}
            navigateTo={navigateTo}
          />
        )
      case "processing":
        return <ProcessingState />
      case "hash-generated":
        return <HashGenerated
           hashReport={hashReport!}
           settings={settings}
           onClear={clearHashReport}
           navigateTo={navigateTo}
          />
      case "compare-hash":
        return (
          <CompareHash
            onSelectFolder={handleSelectFolder}
            onSelectCompareFolder={handleSelectCompareFolder}
            onDropFile={handleDropFile}
            onDropCompareFile={handleDropCompareFile}
            navigateTo={navigateTo}
          />
        )
      case "hash-attached":
        return (
          <HashAttached
            hashReport={hashReport!}
            compareHashReport={compareHashReport!}
            onClearHash={clearHashReport}
            onClearCompareHash={clearCompareHashReport}
            onCompare={compareHashes}
            navigateTo={navigateTo}
          />
        )
      case "hash-compare-completed":
        return <HashCompareCompleted result={comparisonResult!} navigateTo={navigateTo} />
      case "about":
        return <AboutPage navigateTo={navigateTo} />
      default:
        return (
          <LandingPage
            onSelectFolder={handleSelectFolder}
            onDropFile={handleDropFile}
            navigateTo={navigateTo}
          />
        )
    }
  }

  return (
    <div className="bg-[#1a1f2e] min-h-screen flex justify-center items-center">
      <div className="glass-card w-full max-w-2xl mx-auto overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Hash Generator</h1>
              <p className="text-gray-400 mt-1">Generate and compare file hashes securely</p>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
              onClick={toggleSettings}
            >
              <i className="ri-settings-3-line ri-lg"></i>
            </button>
          </div>
        </div>

        {renderContent()}

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Status:</span>
              <span className="text-sky-400">{progressInfo.status}</span>
            </div>
            <span className="text-gray-400">
              {progressInfo.processed}/{progressInfo.total}
            </span>
          </div>
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-200"
              style={{ width: `${progressInfo.percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings)
            setIsSettingsOpen(false)
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  )
}

export default App
