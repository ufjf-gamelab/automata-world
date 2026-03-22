import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Node } from "./AutomatonEditor";
import { NODE_WIDTH } from "./AutomatonEditor";
import styles from "./Node.module.css";

const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 8; // px

interface NodeProps {
    node: Node;
    onDrag: (id: string, x: number, y: number) => void;
    onClick: (event: React.MouseEvent | React.TouchEvent, node: Node) => void;
    onLongPress?: (event: TouchEvent, node: Node) => void;
    screenToWorld: (clientX: number, clientY: number) => { x: number; y: number };
    isActive: boolean;
    isFailed: boolean;
}

const NodeComponent = ({
    node,
    onDrag,
    onClick,
    onLongPress,
    screenToWorld,
    isActive,
    isFailed,
}: NodeProps) => {
    const nodeRef = useRef<SVGGElement>(null);
    const radius = NODE_WIDTH / 2;

    const onDragRef = useRef(onDrag);
    const onClickRef = useRef(onClick);
    const onLongPressRef = useRef(onLongPress);
    const screenToWorldRef = useRef(screenToWorld);
    const nodeRef2 = useRef(node);

    useEffect(() => {
        onDragRef.current = onDrag;
    }, [onDrag]);
    useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);
    useEffect(() => {
        onLongPressRef.current = onLongPress;
    }, [onLongPress]);
    useEffect(() => {
        screenToWorldRef.current = screenToWorld;
    }, [screenToWorld]);
    useEffect(() => {
        nodeRef2.current = node;
    }, [node]);

    // drag (somente mouse)
    useEffect(() => {
        if (!nodeRef.current) return;
        const sel = d3.select(nodeRef.current);

        const drag = d3
            .drag<SVGGElement, unknown>()
            .filter((e) => !("touches" in e)) // ignora touch
            .on("start", function (e) {
                d3.select(this).raise().classed(styles.dragging, true);
                nodeRef.current?.setAttribute("data-drag", "maybe");
                e.sourceEvent?.stopPropagation();
            })
            .on("drag", (e) => {
                nodeRef.current?.setAttribute("data-drag", "yes");
                onDragRef.current(nodeRef2.current.id, e.x, e.y);
            })
            .on("end", function () {
                d3.select(this).classed(styles.dragging, false);
                setTimeout(() => nodeRef.current?.setAttribute("data-drag", "no"), 0);
            });

        sel.call(drag as any);
    }, []);

    // Touch drag/tap/long-press via listeners nativos
    useEffect(() => {
        const el = nodeRef.current;
        if (!el) return;

        let startX = 0;
        let startY = 0;
        let dragging = false;
        let longFired = false;
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
                    onLongPressRef.current?.(e, nodeRef2.current);
                }
            }, LONG_PRESS_MS);
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const t = e.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;

            if (!dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
                dragging = true;
                if (timer) clearTimeout(timer);
                el.classList.add(styles.dragging);
            }

            if (dragging) {
                const { x, y } = screenToWorldRef.current(t.clientX, t.clientY);
                onDragRef.current(nodeRef2.current.id, x, y);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            e.stopPropagation();
            if (timer) clearTimeout(timer);
            el.classList.remove(styles.dragging);

            if (dragging) {
                dragging = false;
                return;
            }

            if (!longFired) {
                onClickRef.current(e as unknown as React.TouchEvent, nodeRef2.current);
            }
        };

        // { passive: false } é o que permite chamar preventDefault()
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    // Click de mouse
    const handleMouseClick = (e: React.MouseEvent) => {
        if (nodeRef.current?.getAttribute("data-drag") === "yes") {
            e.stopPropagation();
            return;
        }
        onClickRef.current(e, nodeRef2.current);
    };

    const outerClasses = [
        styles.outer,
        node.isInitial ? styles.initial : "",
        isActive ? styles.active : "",
        isFailed ? styles.failed : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <g
            ref={nodeRef}
            className={styles.node}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={handleMouseClick}
        >
            <circle className={outerClasses} r={radius} />
            {node.isFinal && <circle className={styles.inner} r={radius - 6} />}
            <text>{node.label}</text>
            {node.isInitial && (
                <path
                    d={`M ${-radius - 25},0 L ${-radius - 8},0`}
                    className={styles.initialArrow}
                    markerEnd="url(#arrowhead-initial)"
                />
            )}
        </g>
    );
};

export default NodeComponent;
