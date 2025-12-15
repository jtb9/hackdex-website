"use client";

import React from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { baseRoms } from "@/data/baseRoms";
import { useBaseRoms } from "@/contexts/BaseRomContext";
import BaseRomCard from "@/components/BaseRomCard";
import RomSelectionModal from "@/components/Roms/RomSelectionModal";
import { platformAcceptAll } from "@/utils/idb";
import { sha1Hex } from "@/utils/hash";

const ALLOWED_TYPES = platformAcceptAll().split(",");

export default function RomsInteractive({ hideLinkedAndCached }: { hideLinkedAndCached?: boolean } = {}) {
  const { supported, linked, statuses, cached, totalCachedBytes, importUploadedBlob, importToCache, removeFromCache, unlinkRom, ensurePermission, countReady } = useBaseRoms();
  const [uploadMsg, setUploadMsg] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [unrecognizedFile, setUnrecognizedFile] = React.useState<File | null>(null);
  const [isSelectingRom, setIsSelectingRom] = React.useState(false);
  const [isCachingSelected, setIsCachingSelected] = React.useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = await importUploadedBlob(file);
    const name = baseRoms.find(r => r.id === id)?.name;
    if (name) setUploadMsg(`Recognized and cached: ${name}`);
    else {
      setUnrecognizedFile(file);
      setIsSelectingRom(true);
    }
    e.target.value = "";
  }

  const linkedOrCached = baseRoms.filter(({ id }) => Boolean(cached[id]) || Boolean(linked[id]));
  const notLinked = baseRoms.filter(({ id }) => !cached[id] && !linked[id]);
  
  const visibleLinkedOrCached = hideLinkedAndCached ? [] : linkedOrCached;
  const visibleNotLinked = hideLinkedAndCached ? baseRoms : notLinked;

  async function handleRomSelect(romId: string) {
    if (!unrecognizedFile) return;
    setIsCachingSelected(true);
    try {
      const selectedRom = baseRoms.find(r => r.id === romId);
      if (!selectedRom) {
        setUploadMsg("ROM not found.");
        return;
      }

      const fileHash = await sha1Hex(unrecognizedFile);
      if (fileHash.toLowerCase() !== selectedRom.sha1.toLowerCase()) {
        setUploadMsg(`Hash mismatch. This doesn't appear to be ${selectedRom.name}. Please select the correct ROM.`);
        return;
      }

      const id = await importUploadedBlob(unrecognizedFile, romId);
      const name = baseRoms.find(r => r.id === id)?.name;
      setUploadMsg(`Recognized and cached: ${name}`);
      setIsSelectingRom(false);
      setUnrecognizedFile(null);
    } catch (error) {
      setUploadMsg("Failed to cache ROM.");
    } finally {
      setIsCachingSelected(false);
    }
  }

  return (
    <>
      {!supported && (
        <div className="mt-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Your browser may not support local file linking for large ROMs. Try Chrome or Edge on desktop if you have issues.
        </div>
      )}

      <div className="mt-6 grid gap-3 text-sm text-foreground/70">
        <div
          className={`rounded-md border-2 border-dashed p-6 sm:p-8 min-h-[140px] ${
            dragActive
              ? "border-[var(--accent)] bg-[var(--accent)]/8 ring-2 ring-[var(--accent)]/30"
              : "border-[var(--border)] bg-[var(--surface-2)]"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const file = e.dataTransfer?.files?.[0];
            if (!file) return;
            if (!ALLOWED_TYPES.includes(`.${file.name.split(".").pop()?.toLowerCase() ?? ""}`)) {
              setUploadMsg(`Unrecognized file. Not cached. Accepted types: ${ALLOWED_TYPES.join(", ")}`);
              return;
            }
            const id = await importUploadedBlob(file);
            const name = baseRoms.find(r => r.id === id)?.name;
            if (name) setUploadMsg(`Recognized and cached: ${name}`);
            else {
              setUnrecognizedFile(file);
              setIsSelectingRom(true);
            }
          }}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-start gap-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-foreground/70">
                <path d="M12 16v-8m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <div className="text-[14px] font-medium">Drag & drop a base ROM here</div>
                <p className="mt-1 text-xs text-foreground/70">Or click to choose a file. Recognized ROMs are cached locally and never uploaded.</p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-700)]">
              <input type="file" onChange={onUpload} className="hidden" accept={platformAcceptAll()} />
              Choose file…
            </label>
          </div>
          {uploadMsg && <div className="mt-2 text-xs text-foreground/70">{uploadMsg}</div>}
        </div>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs text-foreground/70">
          <FaTriangleExclamation size={16} className="inline-block mr-1 text-foreground/30" /> Files are processed locally in your browser and never uploaded.</div>
        <div>Cached size: {(totalCachedBytes / (1024 * 1024)).toFixed(1)} MB</div>
      </div>

      {visibleLinkedOrCached.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/70">Linked or cached</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLinkedOrCached.map(({ id, platform, region }) => {
              const name = baseRoms.find(r => r.id === id)?.name;
              const isLinked = Boolean(linked[id]);
              const status = statuses[id] ?? (isLinked ? "prompt" : "denied");
              const isCached = Boolean(cached[id]);
              return (
                <BaseRomCard
                  key={id}
                  name={name ?? id}
                  platform={platform}
                  region={region}
                  isLinked={isLinked}
                  status={status}
                  isCached={isCached}
                  onRemoveCache={() => removeFromCache(id)}
                  onUnlink={() => unlinkRom(id)}
                  onEnsurePermission={() => ensurePermission(id, true)}
                  onImportCache={() => importToCache(id)}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/70">{hideLinkedAndCached ? "Available ROMs" : "Not linked"}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleNotLinked.map(({ id, name, platform, region }) => (
            <BaseRomCard
              key={id}
              name={name}
              platform={platform}
              region={region}
              isLinked={false}
              status={"denied"}
              isCached={false}
            />
          ))}
        </div>
      </div>

      <RomSelectionModal
        isOpen={isSelectingRom}
        file={unrecognizedFile}
        onSelect={handleRomSelect}
        onCancel={() => {
          setIsSelectingRom(false);
          setUnrecognizedFile(null);
          setUploadMsg(null);
        }}
        isLoading={isCachingSelected}
        linked={linked}
        cached={cached}
      />
    </>
  );
}


