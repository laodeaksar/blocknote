"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DocError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DocError]", error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center space-y-4 max-w-sm px-6">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          Halaman gagal dimuat
        </h2>
        <p className="text-sm text-gray-500">
          Terjadi kesalahan saat memuat dokumen. Coba muat ulang.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Muat ulang
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
