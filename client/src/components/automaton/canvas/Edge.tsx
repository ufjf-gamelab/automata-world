import React from "react";
import type { Edge, Node } from "../AutomatonReducer";
import ActionSign from "./ActionSign";
import { resolveAction, cubicPoint } from "./helpers";
import styles from "./Edge.module.css";

const NODE_WIDTH = 60;
const SIGN_OFFSET = 22;

interface EdgeProps {
    edge: Edge;
    sourceNode: Node;
    targetNode: Node;
    isActive: boolean;
    isSimulating: boolean;
    onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
    totalEdgesInRelation: number;
    bundleSize: number;
    bundleIndex: number;
    hasReverseEdge: boolean;
    avoidanceOffset: number;
}

const EdgeComponent = ({
    edge,
    sourceNode,
    targetNode,
    isActive,
    isSimulating,
    onEdgeClick,
    totalEdgesInRelation,
    bundleSize,
    bundleIndex,
    hasReverseEdge,
    avoidanceOffset,
}: EdgeProps) => {
    const radius = NODE_WIDTH / 2;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdgeClick(e, edge);
    };

    const gClass = [
        styles.edge,
        isActive ? styles.active : "",
        isActive && isSimulating ? styles.simulating : "",
    ]
        .filter(Boolean)
        .join(" ");

    const symbolLine = edge.label.toUpperCase();
    const action = edge.action ? resolveAction(edge.action) : null;

    // ── SELF-LOOP ──────────────────────────────────────────────────────
    if (sourceNode.id === targetNode.id) {
        const lr = 25 + bundleIndex * 10;
        const sx = sourceNode.x - 5,
            sy = sourceNode.y - radius;
        const ex = sourceNode.x + 5,
            ey = sourceNode.y - radius;
        const c1x = sx - lr * 2.25,
            c1y = sy - lr * 2.25;
        const c2x = ex + lr * 2.25,
            c2y = ey - lr * 2.25;
        const path = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;
        const mx = cubicPoint(0.5, sx, c1x, c2x, ex);
        const my = cubicPoint(0.5, sy, c1y, c2y, ey);
        const dmx = cubicPoint(0.5, c1x - sx, c2x - c1x, ex - c2x, 0);
        const dmy = cubicPoint(0.5, c1y - sy, c2y - c1y, ey - c2y, 0);
        const dLen = Math.max(1, Math.sqrt(dmx * dmx + dmy * dmy));
        const px = -dmy / dLen,
            py = dmx / dLen;
        const labelX = mx + px * 14,
            labelY = my + py * 14;
        const signX = mx - px * SIGN_OFFSET,
            signY = my - py * SIGN_OFFSET;

        return (
            <g className={gClass} onClick={handleClick}>
                <path d={path} markerEnd="url(#arrowhead)" />
                <text
                    className={styles.edgeLabelText}
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {symbolLine}
                </text>
                {action && (
                    <ActionSign
                        x={signX}
                        y={signY}
                        symbol={action.symbol}
                        Icon={action.Icon}
                        bgClass={styles.signBg}
                        textClass={styles.signText}
                    />
                )}
            </g>
        );
    }

    // ── ARESTA NORMAL ──────────────────────────────────────────────────
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len,
        uy = dy / len;
    const nx = -uy,
        ny = ux;

    const startX = sourceNode.x + ux * radius,
        startY = sourceNode.y + uy * radius;
    const endX = targetNode.x - ux * radius,
        endY = targetNode.y - uy * radius;
    const midX = (startX + endX) / 2,
        midY = (startY + endY) / 2;

    let curveOffset: number;
    if (avoidanceOffset !== 0) {
        curveOffset =
            avoidanceOffset + (bundleSize > 1 ? (bundleIndex - (bundleSize - 1) / 2) * 30 : 0);
    } else if (totalEdgesInRelation === 1) {
        curveOffset = 0;
    } else {
        curveOffset = (hasReverseEdge ? 65 : 35) + (bundleIndex - (bundleSize - 1) / 2) * 40;
    }

    const curveSide = curveOffset >= 0 ? 1 : -1;
    let pathData: string;
    let labelX: number, labelY: number, signX: number, signY: number;

    if (Math.abs(curveOffset) < 1) {
        pathData = `M ${startX},${startY} L ${endX},${endY}`;
        labelX = midX - nx * 14;
        labelY = midY - ny * 14;
        signX = midX + nx * SIGN_OFFSET;
        signY = midY + ny * SIGN_OFFSET;
    } else {
        const peakX = midX + nx * curveOffset,
            peakY = midY + ny * curveOffset;
        const c1x = (startX + peakX) / 2,
            c1y = (startY + peakY) / 2;
        const c2x = (endX + peakX) / 2,
            c2y = (endY + peakY) / 2;
        pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        const t = 0.5,
            tp = 0.38;
        const cx = cubicPoint(t, startX, c1x, c2x, endX),
            cy = cubicPoint(t, startY, c1y, c2y, endY);
        const px = cubicPoint(tp, startX, c1x, c2x, endX),
            py = cubicPoint(tp, startY, c1y, c2y, endY);
        labelX = cx + nx * curveSide * 16;
        labelY = cy + ny * curveSide * 16;
        signX = px - nx * curveSide * SIGN_OFFSET;
        signY = py - ny * curveSide * SIGN_OFFSET;
    }

    return (
        <g className={gClass} onClick={handleClick}>
            <path d={pathData} markerEnd="url(#arrowhead)" />
            <text
                className={styles.edgeLabelText}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
            >
                {symbolLine}
            </text>
            {action && (
                <ActionSign
                    x={signX}
                    y={signY}
                    symbol={action.symbol}
                    Icon={action.Icon}
                    bgClass={styles.signBg}
                    textClass={styles.signText}
                />
            )}
        </g>
    );
};

export default EdgeComponent;
