"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setAvatar, removeAvatar } from "@/app/(app)/settings/avatar-actions";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/Button";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024; // keep in sync with the bucket limit (0006 migration)
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function AvatarUpload({
  userId,
  name,
  initialUrl,
}: {
  userId: string;
  name: string;
  initialUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 2 MB. Please choose a smaller one.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    // Unique name per upload, inside the user's own folder (required by the
    // storage policies). A new name also avoids stale browser caches.
    const path = `${userId}/${Date.now()}.${EXT[file.type]}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, cacheControl: "3600" });

    if (uploadError) {
      setBusy(false);
      setError(
        uploadError.message.toLowerCase().includes("bucket")
          ? "Photo uploads aren't set up yet (storage bucket missing)."
          : `Upload failed: ${uploadError.message}`,
      );
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const result = await setAvatar(publicUrl);
    setBusy(false);
    if (result.error) {
      await supabase.storage.from("avatars").remove([path]); // don't leave orphans
      setError(result.error);
      return;
    }
    setUrl(publicUrl);
  }

  async function handleRemove() {
    setError(null);
    setBusy(true);
    const result = await removeAvatar();
    setBusy(false);
    if (result.error) setError(result.error);
    else setUrl(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar name={name} url={url} size={72} />
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" aria-hidden />
            {busy ? "Uploading…" : url ? "Change photo" : "Upload photo"}
          </Button>
          {url && !busy && (
            <Button type="button" variant="dangerGhost" size="sm" onClick={handleRemove}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">JPG, PNG, or WebP, up to 2 MB.</p>
        {error && <p className="text-sm text-danger-fg">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        aria-label="Choose a profile photo"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
    </div>
  );
}
