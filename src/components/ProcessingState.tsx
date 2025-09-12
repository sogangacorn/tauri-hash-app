interface ProcessingStateProps {
  progress: number
  stats: {
    current: number
    total: number
    eta: string
  }
}

const ProcessingState = ({ progress, stats }: ProcessingStateProps) => {
  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      <div className="hash-display flex-1 flex flex-col items-center justify-center p-10 rounded-lg cursor-pointer min-h-[300px]">
        <div className="w-20 h-20 flex items-center justify-center text-gray-500 mb-6">
          <i className="ri-loader-4-line ri-3x animate-spin"></i>
        </div>
        <p className="text-gray-300 text-lg font-medium mb-4">Processing...</p>
        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-button flex items-center whitespace-nowrap transition-colors">
          <i className="ri-stop-fill mr-2"></i>
          Stop
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full md:w-56">
        <button className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-file-text-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">Generate Hash</span>
        </button>

        <button className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-refresh-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">Compare Hashes</span>
        </button>

        <button className="action-card p-4 rounded-lg flex flex-col items-center justify-center text-center whitespace-nowrap opacity-50 cursor-not-allowed">
          <div className="w-12 h-12 flex items-center justify-center text-gray-400 mb-3">
            <i className="ri-information-line ri-2x"></i>
          </div>
          <span className="text-gray-300 text-sm">About</span>
        </button>
      </div>
    </div>
  )
}

export default ProcessingState
