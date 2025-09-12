"use client"

import React from "react"
import { useState } from "react"
import type { Settings } from "../types"

interface SettingsModalProps {
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState<Settings>(settings)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-2xl mx-auto overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <i className="ri-close-line ri-lg"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Hash Algorithm */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Hash Algorithm
                </label>
                <select
                  name="algorithm"
                  value={formData.algorithm}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="md5">MD5</option>
                  <option value="sha1">SHA-1</option>
                  <option value="sha256">SHA-256</option>
                  <option value="sha512">SHA-512</option>
                </select>
              </div>

              {/* Other fields in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Test Report No.
                  </label>
                  <input
                    type="text"
                    name="testReportNo"
                    value={formData.testReportNo}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter test report number"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Applicant Co.
                  </label>
                  <input
                    type="text"
                    name="applicantCo"
                    value={formData.applicantCo}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter applicant co."
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Copyright Co.
                  </label>
                  <input
                    type="text"
                    name="copyrightCo"
                    value={formData.copyrightCo}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter copyright co."
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Test Date
                  </label>
                  <input
                    type="date"
                    name="testDate"
                    value={formData.testDate}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    LAB Name
                  </label>
                  <input
                    type="text"
                    name="labName"
                    value={formData.labName}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter lab name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Tester Name
                  </label>
                  <input
                    type="text"
                    name="testerName"
                    value={formData.testerName}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter tester name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Doc. Form ID
                  </label>
                  <input
                    type="text"
                    name="docFormId"
                    value={formData.docFormId}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter doc. form ID"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-button transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-button transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
