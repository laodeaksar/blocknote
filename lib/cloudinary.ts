import { RateLimiter } from "@tanstack/pacer";

const uploadRateLimiter = new RateLimiter(
  () => {},
  {
    limit: 5,
    window: 60_000,
  }
);

export async function uploadToCloudinary(file: File): Promise<string> {
  const prevRejections = uploadRateLimiter.store.state.rejectionCount;
  uploadRateLimiter.maybeExecute();

  if (uploadRateLimiter.store.state.rejectionCount > prevRejections) {
    const times = uploadRateLimiter.store.state.executionTimes;
    const oldest = times.length > 0 ? times[0] : Date.now();
    const retryIn = Math.max(1, Math.ceil((oldest + 60_000 - Date.now()) / 1000));
    throw new Error(
      `Terlalu banyak upload. Coba lagi dalam ${retryIn} detik.`
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary belum dikonfigurasi. Tambahkan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET di Secrets."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload gagal: ${err}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}
