import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import type { Node } from "./AutomatonEditor";
import { NODE_WIDTH } from "./AutomatonEditor";
import styles from "./Node.module.css";

const LONG_PRESS_MS = 450; // tempo (ms) para abrir menu no celular

interface NodeProps {
    node: Node;
    onDrag: (id: string, x: number, y: number) => void;
    onClick: (event: React.MouseEvent | React.TouchEvent, node: Node) => void;
    onLongPress?: (event: React.TouchEvent, node: Node) => void;
    isActive: boolean;
    isFailed: boolean;
}

const NodeComponent = ({ node, onDrag, onClick, onLongPress, isActive, isFailed }: NodeProps) => {
    const nodeRef = useRef<SVGGElement>(null);
    const radius = NODE_WIDTH / 2;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchMovedRef = useRef(false);

    // D3 drag (mouse + touch via d3)
    useEffect(() => {
        if (!nodeRef.current) return;
        const selection = d3.select(nodeRef.current);

        const dragHandler = d3
            .drag<SVGGElement, unknown>()
            .on("start", function (event) {
                d3.select(this).raise().classed(styles.dragging, true);
                nodeRef.current?.setAttribute("data-dragging", "maybe");
                event.sourceEvent?.stopPropagation();
            })
            .on("drag", (event) => {
                nodeRef.current?.setAttribute("data-dragging", "true");
                onDrag(node.id, event.x, event.y);
            })
            .on("end", function () {
                d3.select(this).classed(styles.dragging, false);
                setTimeout(() => nodeRef.current?.setAttribute("data-dragging", "false"), 0);
            });

        selection.call(dragHandler as any);
    }, [node.id, onDrag]);

    // Click (mouse)
    const handleClick = (e: React.MouseEvent) => {
        if (nodeRef.current?.getAttribute("data-dragging") === "true") {
            e.stopPropagation();
            return;
        }
        onClick(e, node);
    };

    // Long-press (touch) para abrir menu no celular
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            touchMovedRef.current = false;
            timerRef.current = setTimeout(() => {
                if (!touchMovedRef.current) {
                    onLongPress?.(e, node);
                }
            }, LONG_PRESS_MS);
        },
        [node, onLongPress],
    );

    const handleTouchMove = useCallback(() => {
        touchMovedRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            // Toque rápido sem movimento = clique
            if (!touchMovedRef.current) {
                onClick(e, node);
            }
        },
        [node, onClick],
    );

    // Classes de estado
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
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
