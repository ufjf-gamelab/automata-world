import React from "react";
import type { Edge, Node } from "../AutomatonReducer";
import { ACTION_SVG_SYMBOL } from "../../game/gameConfig";
import styles from "./Edge.module.css";

const NODE_WIDTH = 60;

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

/** Pill de fundo + símbolo Unicode da ação com halo */
function ActionBadge({ x, y, symbol }: { x: number; y: number; symbol: string }) {
    const w = Math.max(22, symbol.length * 11 + 10);
    const h = 20;
    return (
        <g>
            <rect
                className={styles.edgeActionBg}
                x={x - w / 2}
                y={y - h / 2}
                width={w}
                height={h}
                rx={5}
                ry={5}
            />
            <text
                className={styles.edgeActionText}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
            >
                {symbol}
            </text>
        </g>
    );
}

/** Label principal da aresta: símbolo da fita + ação abaixo */
function EdgeLabel({
    x,
    y,
    dy,
    symbolLine,
    actionSymbol,
}: {
    x: number;
    y: number;
    dy: number;
    symbolLine: string;
    actionSymbol: string | null;
}) {
    const lineH = 16; // distância entre as duas linhas
    const actionY = y + dy + (actionSymbol ? lineH : 0);

    return (
        <g>
            {/* Símbolo da fita */}
            <text
                className={styles.edgeLabelText}
                x={x}
                y={y + dy}
                textAnchor="middle"
                dominantBaseline="central"
            >
                {symbolLine}
            </text>

            {/* Ação com pill de fundo */}
            {actionSymbol && <ActionBadge x={x} y={actionY + lineH * 0.5} symbol={actionSymbol} />}
        </g>
    );
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

    const handleEdgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdgeClick(e, edge);
    };

    const gClasses = [
        styles.edge,
        isActive ? styles.active : "",
        isActive && isSimulating ? styles.simulating : "",
    ]
        .filter(Boolean)
        .join(" ");

    const symbolLine = edge.label.toUpperCase();
    const actionSymbol = edge.action
        ? (ACTION_SVG_SYMBOL[edge.action.toLowerCase()] ?? edge.action.toUpperCase())
        : null;

    // ── SELF-LOOP ──────────────────────────────────────────────
    if (sourceNode.id === targetNode.id) {
        const loopRadius = 25 + bundleIndex * 10;
        const startX = sourceNode.x - 5;
        const startY = sourceNode.y - radius;
        const endX = sourceNode.x + 5;
        const endY = sourceNode.y - radius;
        const c1x = startX - loopRadius * 2.25;
        const c1y = startY - loopRadius * 2.25;
        const c2x = endX + loopRadius * 2.25;
        const c2y = endY - loopRadius * 2.25;
        const pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        const labelX = (1 / 8) * startX + (3 / 8) * c1x + (3 / 8) * c2x + (1 / 8) * endX;
        const labelY = (1 / 8) * startY + (3 / 8) * c1y + (3 / 8) * c2y + (1 / 8) * endY;

        return (
            <g className={gClasses} onClick={handleEdgeClick}>
                <path d={pathData} markerEnd="url(#arrowhead)" />
                <EdgeLabel
                    x={labelX}
                    y={labelY}
                    dy={0}
                    symbolLine={symbolLine}
                    actionSymbol={actionSymbol}
                />
            </g>
        );
    }

    // ── ARESTA NORMAL ──────────────────────────────────────────
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux = dx / len;
    const uy = dy / len;

    const startX = sourceNode.x + ux * radius;
    const startY = sourceNode.y + uy * radius;
    const endX = targetNode.x - ux * radius;
    const endY = targetNode.y - uy * radius;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const nx = -uy;
    const ny = ux;

    let curveOffset: number;
    if (avoidanceOffset !== 0) {
        const parallelBump = bundleSize > 1 ? (bundleIndex - (bundleSize - 1) / 2) * 30 : 0;
        curveOffset = avoidanceOffset + parallelBump;
    } else if (totalEdgesInRelation === 1) {
        curveOffset = 0;
    } else {
        const baseCurve = hasReverseEdge ? 65 : 35;
        const parallelSpread = 40;
        const midIndex = (bundleSize - 1) / 2;
        curveOffset = baseCurve + (bundleIndex - midIndex) * parallelSpread;
    }

    let pathData: string;
    let labelX: number;
    let labelY: number;

    if (Math.abs(curveOffset) < 1) {
        pathData = `M ${startX},${startY} L ${endX},${endY}`;
        labelX = midX;
        labelY = midY;
    } else {
        const peakX = midX + nx * curveOffset;
        const peakY = midY + ny * curveOffset;
        const c1x = (startX + peakX) / 2;
        const c1y = (startY + peakY) / 2;
        const c2x = (endX + peakX) / 2;
        const c2y = (endY + peakY) / 2;
        pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        labelX = (1 / 8) * startX + (3 / 8) * c1x + (3 / 8) * c2x + (1 / 8) * endX;
        labelY = (1 / 8) * startY + (3 / 8) * c1y + (3 / 8) * c2y + (1 / 8) * endY;
    }

    const labelDy = curveOffset > 0 ? -12 : curveOffset < 0 ? 12 : -12;

    return (
        <g className={gClasses} onClick={handleEdgeClick}>
            <path d={pathData} markerEnd="url(#arrowhead)" />
            <EdgeLabel
                x={labelX}
                y={labelY}
                dy={labelDy}
                symbolLine={symbolLine}
                actionSymbol={actionSymbol}
            />
        </g>
    );
};

export default EdgeComponent;
