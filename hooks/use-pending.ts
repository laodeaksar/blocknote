"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"

/**
 * Wraps React `useTransition` — returns `isPending` + `run()` untuk
 * menjalankan async action dalam sebuah transition.
 *
 * @example
 * const { isPending, run } = usePending()
 * run(async () => await saveMutation(data))
 */
export function usePending() {
  const [isPending, startTransition] = useTransition()

  const run = useCallback(
    (fn: () => void | Promise<void>) => {
      startTransition(() => {
        void fn()
      })
    },
    [startTransition],
  )

  return { isPending, run }
}

/**
 * Detects initial loading saat Convex query atau data async pertama kali
 * di-fetch (value masih `undefined`). Setelah data pertama kali tersedia,
 * `isInitialLoading` tidak akan kembali `true` meski data berubah.
 *
 * @example
 * const docs = useQuery(api.documents.list)
 * const isInitialLoading = useInitialLoading(docs)
 */
export function useInitialLoading(value: unknown): boolean {
  const resolved = useRef(false)
  const [loading, setLoading] = useState(value === undefined)

  useEffect(() => {
    if (!resolved.current && value !== undefined) {
      resolved.current = true
      setLoading(false)
    }
  }, [value])

  return loading
}

/**
 * Menggabungkan beberapa `isPending` / loading flags menjadi satu boolean.
 * Berguna untuk disable tombol saat salah satu dari beberapa operasi sedang berjalan.
 *
 * @example
 * const saving = usePending()
 * const deleting = usePending()
 * const isBusy = useCombinedPending(saving.isPending, deleting.isPending)
 */
export function useCombinedPending(...flags: boolean[]): boolean {
  return flags.some(Boolean)
}

/**
 * Tracks multiple named async operations secara independen.
 * Berguna saat ada banyak item dalam list dan masing-masing punya tombol aksi.
 *
 * @example
 * const { isPending, run } = usePendingMap()
 * run("delete-doc-123", () => deleteMutation({ id: "doc-123" }))
 * isPending("delete-doc-123") // true saat sedang hapus
 */
export function usePendingMap() {
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set())

  const run = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      setPendingKeys((prev) => new Set(prev).add(key))
      try {
        await fn()
      } finally {
        setPendingKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [],
  )

  const isPending = useCallback(
    (key: string) => pendingKeys.has(key),
    [pendingKeys],
  )

  const isAnyPending = pendingKeys.size > 0

  return { isPending, isAnyPending, run }
}
