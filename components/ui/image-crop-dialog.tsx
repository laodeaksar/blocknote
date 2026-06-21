"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  clampOffset,
  cropImageToBlob,
  CropState,
  getBaseScale,
  loadImage,
} from "@/lib/image-crop";

const CONTAINER = 280;

interface Props {
  src: string | null;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropDialog({ src, onApply, onCancel }: Props) {
  const open = !!src;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  const [state, setState] = useState<CropState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!src) return;
    setState({ zoom: 1, offsetX: 0, offsetY: 0 });
    loadImage(src).then((img) => {
      imgRef.current = img;
      draw(img, { zoom: 1, offsetX: 0, offsetY: 0 });
    });
  }, [src]);

  const draw = useCallback((img: HTMLImageElement, s: CropState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const base = getBaseScale(img.naturalWidth, img.naturalHeight, CONTAINER);
    const scale = base * s.zoom;
    const left = CONTAINER / 2 - (img.naturalWidth * scale) / 2 + s.offsetX;
    const top = CONTAINER / 2 - (img.naturalHeight * scale) / 2 + s.offsetY;

    ctx.clearRect(0, 0, CONTAINER, CONTAINER);
    ctx.drawImage(img, left, top, img.naturalWidth * scale, img.naturalHeight * scale);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, CONTAINER, CONTAINER);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(CONTAINER / 2, CONTAINER / 2, CONTAINER / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CONTAINER / 2, CONTAINER / 2, CONTAINER / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, []);

  const updateState = useCallback(
    (next: CropState) => {
      if (!imgRef.current) return;
      const img = imgRef.current;
      const clamped = clampOffset(
        next.offsetX,
        next.offsetY,
        img.naturalWidth,
        img.naturalHeight,
        CONTAINER,
        next.zoom,
      );
      const final: CropState = { ...next, offsetX: clamped.x, offsetY: clamped.y };
      setState(final);
      draw(img, final);
    },
    [draw],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: state.offsetX,
      oy: state.offsetY,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    updateState({ ...state, offsetX: dragRef.current.ox + dx, offsetY: dragRef.current.oy + dy });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    updateState({ ...state, zoom: Math.min(3, Math.max(1, state.zoom + delta)) });
  };

  const handleApply = async () => {
    if (!imgRef.current) return;
    setApplying(true);
    try {
      const blob = await cropImageToBlob(imgRef.current, state, CONTAINER, 512);
      onApply(blob);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-xs p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-sm">Crop foto profil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 p-5">
          <canvas
            ref={canvasRef}
            width={CONTAINER}
            height={CONTAINER}
            className="rounded-full cursor-grab active:cursor-grabbing touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            style={{ width: CONTAINER, height: CONTAINER }}
          />

          <div className="w-full flex items-center gap-3 px-1">
            <span className="text-[10px] text-muted-foreground w-4 text-center">1×</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={state.zoom}
              onChange={(e) => updateState({ ...state, zoom: Number(e.target.value) })}
              className="flex-1 accent-foreground h-1"
            />
            <span className="text-[10px] text-muted-foreground w-4 text-center">3×</span>
          </div>

          <p className="text-[11px] text-muted-foreground/70">
            Drag untuk reposisi · Scroll atau slider untuk zoom
          </p>
        </div>

        <DialogFooter className="px-5 pb-5 gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={applying}>
            Batal
          </Button>
          <Button size="sm" onClick={handleApply} disabled={applying}>
            {applying ? "Memproses…" : "Gunakan foto ini"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
