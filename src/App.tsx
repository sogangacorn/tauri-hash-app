"use client"

import { useState } from "react"
import { open } from "@tauri-apps/plugin-dialog"

import type { HashReport,FileHash,HashAlgorithm,Settings } from "./types"
import { invoke } from "@tauri-apps/api/core"

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
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Ready")
  const [processingStats, setProcessingStats] = useState<{ current: number; total: number; eta: string }>({
    current: 0,
    total: 0,
    eta: "00:00:00",
  })

  // Mock function to simulate hash generation
  const generateHash = async (path: string) => {
    setAppState("processing")
    setStatusMessage("Computing hash…")
    setProgress(0)

     try {
      // 2) 백엔드 커맨드 호출
          const report: HashReport = await invoke("compute_hash", { path })
      
          // 3) 리포트로 상태·진행률 업데이트
          setHashReport(report)
          setStatusMessage("Hash generated completely")
          setAppState("hash-generated")
          setProgress(100) // 완료
          setProcessingStats({
            current: report.fileCount + report.folderCount,
            total: report.fileCount + report.folderCount,
            eta: report.timeTaken,
          })
        } catch (error) {
          console.error(error)
          setStatusMessage("Error computing hash")
          setAppState("error")
        }
  }

  // Mock function to simulate hash comparison
  const compareHashes = async () => {
    if (!hashReport || !compareHashReport) return

    setAppState("processing")
    setStatusMessage("Comparing Hash Reports")
    setProgress(0)

    // Simulate processing
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)

        // Compare hashes
        const result = hashReport.hash === compareHashReport.hash ? "identical" : "mismatch"
        setComparisonResult(result)
        setStatusMessage("Ready")
        setAppState("hash-compare-completed")
      }

      setProgress(currentProgress)
    }, 100)
  }

  // Helper function to create a mock hash
  const createMockHash = (algorithm: HashAlgorithm): string => {
    const lengths: Record<HashAlgorithm, number> = {
      md5: 32,
      sha1: 40,
      sha256: 64,
      sha512: 128,
    }

    const chars = "0123456789ABCDEF"
    let result = ""
    for (let i = 0; i < lengths[algorithm]; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
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
    }
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
        // Create a mock hash report for comparison
        const mockReport: HashReport = {
          hash: createMockHash(settings.algorithm),
          timeTaken: "00:02:30",
          folderCount: 987,
          fileCount: 9876,
          path: selected,
        }

        setCompareHashReport(mockReport)
        setAppState("hash-attached")
      }
    } catch (error) {
      console.error("Error selecting folder:", error)
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
        return <LandingPage onSelectFolder={handleSelectFolder} navigateTo={navigateTo} />
      case "processing":
        return <ProcessingState progress={progress} stats={processingStats} />
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
        return <LandingPage onSelectFolder={handleSelectFolder} navigateTo={navigateTo} />
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

        <div className="status-bar p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Status:</span>
              <span className={`${statusMessage === "Ready" ? "text-green-500" : "text-sky-500"}`}>
                {statusMessage}
              </span>
            </div>
            <span className="text-gray-500">
              {appState === "processing" &&
                `(${processingStats.current}/${processingStats.total}, ETA: ${processingStats.eta})`}
            </span>
          </div>
          <div className="mt-3 progress-bar">
            <div
              className={`progress-bar-fill ${statusMessage === "Ready" ? "bg-green-500" : "bg-sky-500"}`}
              style={{ width: `${progress}%` }}
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
