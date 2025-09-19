"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type DragEventHandler,
} from "react"
import { listen } from "@tauri-apps/api/event"

interface DropzoneOptions {
  onDrop: (path: string) => void
}

interface DropzoneHandlers {
  onDragEnter: DragEventHandler<HTMLDivElement>
  onDragLeave: DragEventHandler<HTMLDivElement>
  onDragOver: DragEventHandler<HTMLDivElement>
  onDrop: DragEventHandler<HTMLDivElement>
}

declare global {
  interface Window {
    __TAURI__?: object
  }
}

export function useDropzone({ onDrop: handlePathDrop }: DropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const mountedRef = useRef(true)
  const dragDepthRef = useRef(0)
  const isOverRef = useRef(false)
  const dropArmedRef = useRef(false)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const resetState = useCallback(() => {
    dragDepthRef.current = 0
    isOverRef.current = false
    dropArmedRef.current = false
    if (mountedRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDropPayload = useCallback(
    (payload?: string[]) => {
      if (!payload || payload.length === 0) {
        resetState()
        return
      }

      const path = payload[0]
      if (!path) {
        resetState()
        return
      }

      resetState()
      handlePathDrop(path)
    },
    [handlePathDrop, resetState]
  )

  useEffect(() => {
    if (typeof window === "undefined" || !window.__TAURI__) {
      return
    }

    const unlistenDrop = listen<string[]>("tauri://file-drop", (event) => {
      if (!isOverRef.current && !dropArmedRef.current) {
        return
      }

      handleDropPayload(event.payload)
    })

    const unlistenCancel = listen<void>("tauri://file-drop-cancelled", () => {
      if (!isOverRef.current && !dropArmedRef.current) {
        return
      }

      resetState()
    })

    return () => {
      unlistenDrop.then((fn) => fn())
      unlistenCancel.then((fn) => fn())
    }
  }, [handleDropPayload, resetState])

  const onDragEnter = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.stopPropagation()

    dragDepthRef.current += 1

    if (!isOverRef.current) {
      isOverRef.current = true
      if (mountedRef.current) {
        setIsDragging(true)
      }
    }
  }, [])

  const onDragLeave = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.stopPropagation()

    if (dragDepthRef.current > 0) {
      dragDepthRef.current -= 1
    }

    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0
      isOverRef.current = false
      dropArmedRef.current = false
      if (mountedRef.current) {
        setIsDragging(false)
      }
    }
  }, [])

  const onDragOver = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDomDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()
      event.stopPropagation()

      dragDepthRef.current = 0

      const droppedFiles = Array.from(event.dataTransfer?.files ?? [])
      const first = droppedFiles[0] as { path?: string } | undefined

      if (first?.path) {
        handleDropPayload([first.path])
        return
      }

      dropArmedRef.current = true
      isOverRef.current = false
      if (mountedRef.current) {
        setIsDragging(false)
      }
    },
    [handleDropPayload]
  )

  const dropzoneProps: DropzoneHandlers = useMemo(
    () => ({
      onDragEnter,
      onDragLeave,
      onDragOver,
      onDrop: handleDomDrop,
    }),
    [onDragEnter, onDragLeave, onDragOver, handleDomDrop]
  )

  return { isDragging, dropzoneProps }
}
