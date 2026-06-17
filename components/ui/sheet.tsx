"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SPRING = "cubic-bezier(0.32,0.72,0,1)"
const CLOSE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.4

type Side = "top" | "right" | "bottom" | "left"

function getDelta(
  side: Side,
  dx: number,
  dy: number
): { delta: number; isForward: boolean } {
  switch (side) {
    case "right":  return { delta: dx,  isForward: dx > 0 }
    case "left":   return { delta: -dx, isForward: dx < 0 }
    case "bottom": return { delta: dy,  isForward: dy > 0 }
    case "top":    return { delta: -dy, isForward: dy < 0 }
  }
}

function applyTranslate(el: HTMLElement, side: Side, px: number) {
  switch (side) {
    case "right":  el.style.transform = `translateX(${px}px)`;  break
    case "left":   el.style.transform = `translateX(${-px}px)`; break
    case "bottom": el.style.transform = `translateY(${px}px)`;  break
    case "top":    el.style.transform = `translateY(${-px}px)`; break
  }
}

function useSwipeToClose(
  popupRef: React.RefObject<HTMLElement | null>,
  closeRef: React.RefObject<HTMLButtonElement | null>,
  side: Side,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!enabled) return
    const el = popupRef.current
    if (!el) return

    let start: { x: number; y: number; time: number } | null = null
    let dragging = false
    let lastDelta = 0
    let lastTime = 0

    const onTouchStart = (e: TouchEvent) => {
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }
      dragging = false
      lastDelta = 0
      lastTime = Date.now()
      el.style.transition = "none"
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!start) return
      const dx = e.touches[0].clientX - start.x
      const dy = e.touches[0].clientY - start.y
      const { delta, isForward } = getDelta(side, dx, dy)

      if (!dragging) {
        const abs = Math.abs(delta)
        const crossAbs = Math.abs(side === "right" || side === "left" ? dy : dx)
        if (abs < 6 && crossAbs < 6) return
        if (!isForward || crossAbs > abs) { start = null; return }
        dragging = true
      }

      e.preventDefault()
      const resistance = delta > 60 ? 60 + (delta - 60) * 0.3 : delta
      lastDelta = resistance
      lastTime = Date.now()
      applyTranslate(el, side, Math.max(0, resistance))
    }

    const onTouchEnd = () => {
      if (!start || !dragging) {
        el.style.transition = ""
        el.style.transform = ""
        start = null
        dragging = false
        return
      }

      const elapsed = Date.now() - lastTime
      const velocity = elapsed > 0 ? lastDelta / elapsed : 0

      if (lastDelta >= CLOSE_THRESHOLD || velocity >= VELOCITY_THRESHOLD) {
        closeRef.current?.click()
      } else {
        el.style.transition = `transform 280ms ${SPRING}`
        el.style.transform = ""
        setTimeout(() => { el.style.transition = "" }, 300)
      }

      start = null
      dragging = false
      lastDelta = 0
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [popupRef, closeRef, side, enabled])
}

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/20 transition-[opacity,backdrop-filter] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  swipeToClose = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: Side
  showCloseButton?: boolean
  swipeToClose?: boolean
}) {
  const popupRef = React.useRef<HTMLDivElement>(null)
  const hiddenCloseRef = React.useRef<HTMLButtonElement>(null)

  useSwipeToClose(popupRef, hiddenCloseRef, side, swipeToClose)

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        ref={popupRef}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg border-border",
          "transition-[transform,opacity] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
          "data-ending-style:opacity-0 data-starting-style:opacity-0",
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:border-x data-[side=bottom]:rounded-t-2xl data-[side=bottom]:data-ending-style:translate-y-[110%] data-[side=bottom]:data-starting-style:translate-y-[110%]",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:border-y data-[side=left]:rounded-r-2xl data-[side=left]:data-ending-style:translate-x-[-110%] data-[side=left]:data-starting-style:translate-x-[-110%]",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:border-y data-[side=right]:rounded-l-2xl data-[side=right]:data-ending-style:translate-x-[110%] data-[side=right]:data-starting-style:translate-x-[110%]",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:border-x data-[side=top]:rounded-b-2xl data-[side=top]:data-ending-style:translate-y-[-110%] data-[side=top]:data-starting-style:translate-y-[-110%]",
          "data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {swipeToClose && (
          <SheetPrimitive.Close
            render={<button ref={hiddenCloseRef} aria-hidden tabIndex={-1} style={{ display: "none" }} />}
          />
        )}

        {swipeToClose && (side === "bottom" || side === "top") && (
          <div
            className="mx-auto mt-3 mb-1 h-1 w-10 shrink-0 rounded-full bg-border"
            aria-hidden
          />
        )}

        {children}

        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button variant="ghost" className="absolute top-3 right-3" size="icon-sm">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            }
          />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("cn-font-heading text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
