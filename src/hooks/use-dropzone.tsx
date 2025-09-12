"use client"

import { useState, useEffect, useCallback } from "react"
import { listen } from "@tauri-apps/api/event"

interface DropzoneOptions {
  onDrop: (path: string) => void
}

export function useDropzone({ onDrop }: DropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (event: { payload: string[] }) => {
      setIsDragging(false)
      const path = event.payload[0]
      if (path) {
        onDrop(path)
      }
    },
    [onDrop]
  )

  useEffect(() => {
    const unlistenHover = listen<string[]>("tauri://file-drop-hover", () => {
      if (!isDragging) setIsDragging(true)
    })

    const unlistenDrop = listen<string[]>("tauri://file-drop", handleDrop)

    const unlistenCancel = listen<void>("tauri://file-drop-cancelled", () => {
      setIsDragging(false)
    })

    return () => {
      unlistenHover.then((fn) => fn())
      unlistenDrop.then((fn) => fn())
      unlistenCancel.then((fn) => fn())
    }
  }, [handleDrop, isDragging])

  return { isDragging }
}
