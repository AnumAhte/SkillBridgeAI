"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.docx,.doc,.txt";

/**
 * Drag-and-drop CV uploader. Sends the file to /api/career/extract and returns
 * the extracted plain text via onExtracted. Purely presentational + upload —
 * skill analysis is triggered by the parent.
 */
export function CvDropzone({
  onExtracted,
}: {
  onExtracted: (text: string, filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    setFilename(file.name);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/career/extract", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Could not read file");
      onExtracted(json.data.text, json.data.filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setFilename(null);
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-input hover:border-primary/50",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : filename ? (
          <FileText className="h-8 w-8 text-primary" />
        ) : (
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        )}
        <div className="text-sm">
          {uploading ? (
            <span className="font-medium">Extracting text…</span>
          ) : filename ? (
            <span className="inline-flex items-center gap-1 font-medium">
              {filename}
              <button
                type="button"
                aria-label="Clear file"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilename(null);
                }}
                className="rounded p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground">Drop your CV here</span> or click to browse
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT · up to 8&nbsp;MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
