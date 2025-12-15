"use client";

import React from "react";
import { baseRoms } from "@/data/baseRoms";
import BaseRomCard from "@/components/BaseRomCard";
import Button from "@/components/Button";
import { calculateLikelyRomMatch } from "@/utils/rom-matching";

type RomSelectionModalProps = {
  isOpen: boolean;
  file: File | null;
  onSelect: (romId: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  linked?: Record<string, any>;
  cached?: Record<string, boolean>;
};

export default function RomSelectionModal({
  isOpen,
  file,
  onSelect,
  onCancel,
  isLoading,
  linked,
  cached,
}: RomSelectionModalProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  
  const availableRoms = React.useMemo(
    () => baseRoms.filter(rom => !linked?.[rom.id] && !cached?.[rom.id]),
    [linked, cached]
  );
  
  const likelyId = React.useMemo(
    () => (file ? calculateLikelyRomMatch(file.name, availableRoms) : null),
    [file, availableRoms]
  );

  const gridRef = React.useRef<HTMLDivElement>(null);
  const likelyCardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && likelyId && likelyCardRef.current) {
      setTimeout(() => {
        likelyCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 0);
    }
  }, [isOpen, likelyId]);

  if (!isOpen || !file) return null;

  const handleSelect = async () => {
    if (selectedId) {
      await onSelect(selectedId);
      setSelectedId(null);
    }
  };

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select ROM"
        className="relative z-[101] card backdrop-blur-lg dark:!bg-black/70 w-[70vw] h-[70vh] flex flex-col rounded-lg overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-foreground">
            Which ROM is this?
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            File: <span className="font-mono text-foreground/90">{file.name}</span>
          </p>
          {likelyId && (
            <p className="mt-1 text-xs text-amber-400">
              Likely match: {baseRoms.find(r => r.id === likelyId)?.name}
            </p>
          )}
        </div>

        <div
          ref={gridRef}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableRoms.map((rom) => (
              <div
                key={rom.id}
                ref={likelyId === rom.id ? likelyCardRef : undefined}
              >
                <BaseRomCard
                  name={rom.name}
                  platform={rom.platform}
                  region={rom.region}
                  isLinked={false}
                  status="denied"
                  isCached={false}
                  isSelectable
                  isSelected={selectedId === rom.id}
                  isLikely={likelyId === rom.id}
                  onSelect={() => setSelectedId(rom.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border)] p-6 flex gap-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedId || isLoading}
            isLoading={isLoading}
            className="flex-1"
          >
            Select & Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
