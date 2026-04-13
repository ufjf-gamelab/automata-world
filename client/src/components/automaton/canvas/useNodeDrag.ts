// Custom hook that wires D3 mouse-drag and native touch events onto an SVG node element.
import { useEffect } from "react";
import * as d3 from "d3";
import type { RefObject } from "react";
import type { Node } from "../AutomatonReducer";

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 8; // px

interface UseNodeDragParams {
    nodeRef: RefObject<SVGGElement | null>;
    nodeDataRef: RefObject<Node>;
    onDragRef: RefObject<(id: string, x: number, y: number) => void>;
    onClickRef: RefObject<(event: React.MouseEvent | React.TouchEvent, node: Node) => void>;
    onLongPressRef: RefObject<((event: TouchEvent, node: Node) => void) | undefined>;
    screenToWorldRef: RefObject<(clientX: number, clientY: number) => { x: number; y: number }>;
    draggingClass: string;
}

export function useNodeDrag({
    nodeRef,
    nodeDataRef,
    onDragRef,
    onClickRef,
    onLongPressRef,
    screenToWorldRef,
    draggingClass,
}: UseNodeDragParams) {
    // Mouse drag via D3
    useEffect(() => {
        if (!nodeRef.current) return;
        const sel = d3.select(nodeRef.current);

        const drag = d3
            .drag<SVGGElement, unknown>()
            .filter((e) => !("touches" in e))
            .on("start", function (e) {
                d3.select(this).raise().classed(draggingClass, true);
                nodeRef.current?.setAttribute("data-drag", "maybe");
                e.sourceEvent?.stopPropagation();
            })
            .on("drag", (e) => {
                nodeRef.current?.setAttribute("data-drag", "yes");
                onDragRef.current(nodeDataRef.current.id, e.x, e.y);
            })
            .on("end", function () {
                d3.select(this).classed(draggingClass, false);
                setTimeout(() => nodeRef.current?.setAttribute("data-drag", "no"), 0);
            });

        sel.call(drag as any);
    }, []);

    // Touch drag / tap / long-press via native listeners
    useEffect(() => {
        const el = nodeRef.current;
        if (!el) return;

        let startX = 0,
            startY = 0,
            dragging = false,
            longFired = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const onTouchStart = (e: TouchEvent) => {
            e.stopPropagation();
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            dragging = false;
            longFired = false;
            el.parentElement?.appendChild(el);
            timer = setTimeout(() => {
                if (!dragging) {
                    longFired = true;
                    onLongPressRef.current?.(e, nodeDataRef.current);
                }
            }, LONG_PRESS_MS);
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const t = e.touches[0];
            if (!dragging && Math.hypot(t.clientX - startX, t.clientY - startY) > DRAG_THRESHOLD) {
                dragging = true;
                if (timer) clearTimeout(timer);
                el.classList.add(draggingClass);
            }
            if (dragging) {
                const { x, y } = screenToWorldRef.current(t.clientX, t.clientY);
                onDragRef.current(nodeDataRef.current.id, x, y);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            e.stopPropagation();
            if (timer) clearTimeout(timer);
            el.classList.remove(draggingClass);
            if (dragging) {
                dragging = false;
                return;
            }
            if (!longFired)
                onClickRef.current(e as unknown as React.TouchEvent, nodeDataRef.current);
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, []);
}
