import React from "react";
import type { Edge, Node } from "./AutomatonEditor";
import { GAME_COMMANDS } from "../game/gameConfig";
import styles from "./Edge.module.css";

const NODE_WIDTH = 60;

// Mapeia key do comando para a descrição curta exibida na aresta
const ACTION_LABEL: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.description]),
);

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
    edge, sourceNode, targetNode,
    isActive, isSimulating, onEdgeClick,
    totalEdgesInRelation, bundleSize, bundleIndex,
    hasReverseEdge, avoidanceOffset,
}: EdgeProps) => {
    const radius = NODE_WIDTH / 2;

    const handleEdgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdgeClick(e, edge);
    };

    const gClasses = [
        styles.edge,
        isActive                 ? styles.active    : "",
        isActive && isSimulating ? styles.simulating : "",
    ].filter(Boolean).join(" ");

    // Linha 1: símbolo lido na fita
    const symbolLine = edge.label.toUpperCase();
    // Linha 2: ação (se existir)
    const actionLine = edge.action ? `${ACTION_LABEL[edge.action] ?? edge.action.toUpperCase()}` : null;

    const renderLabel = (x: number, y: number, dy: number) => (
        <text
            className={styles.edgeLabelText}
            x={x}
            y={y}
            dy={dy}
            textAnchor="middle"
        >
            <tspan x={x} dy={actionLine ? "-0.5em" : "0"}>{symbolLine}</tspan>
            {actionLine && (
                <tspan x={x} dy="1.1em" className={styles.edgeActionText}>
                    {actionLine}
                </tspan>
            )}
        </text>
    );

    // SELF-LOOP
    if (sourceNode.id === targetNode.id) {
        const loopRadius = 25 + bundleIndex * 10;
        const startX = sourceNode.x - 5;
        const startY = sourceNode.y - radius;
        const endX   = sourceNode.x + 5;
        const endY   = sourceNode.y - radius;
        const c1x = startX - loopRadius * 2.25;
        const c1y = startY - loopRadius * 2.25;
        const c2x = endX   + loopRadius * 2.25;
        const c2y = endY   - loopRadius * 2.25;
        const pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        const labelX = (1/8)*startX + (3/8)*c1x + (3/8)*c2x + (1/8)*endX;
        const labelY = (1/8)*startY + (3/8)*c1y + (3/8)*c2y + (1/8)*endY;

        return (
            <g className={gClasses} onClick={handleEdgeClick}>
                <path d={pathData} markerEnd="url(#arrowhead)" />
                {renderLabel(labelX, labelY, 0)}
            </g>
        );
    }

    // ARESTA NORMAL
    const dx  = targetNode.x - sourceNode.x;
    const dy  = targetNode.y - sourceNode.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const ux  = dx / len;
    const uy  = dy / len;

    const startX = sourceNode.x + ux * radius;
    const startY = sourceNode.y + uy * radius;
    const endX   = targetNode.x - ux * radius;
    const endY   = targetNode.y - uy * radius;
    const midX   = (startX + endX) / 2;
    const midY   = (startY + endY) / 2;

    const nx = -uy;
    const ny =  ux;

    let curveOffset: number;
    if (avoidanceOffset !== 0) {
        const parallelBump = bundleSize > 1 ? (bundleIndex - (bundleSize - 1) / 2) * 30 : 0;
        curveOffset = avoidanceOffset + parallelBump;
    } else if (totalEdgesInRelation === 1) {
        curveOffset = 0;
    } else {
        const baseCurve      = hasReverseEdge ? 65 : 35;
        const parallelSpread = 40;
        const midIndex       = (bundleSize - 1) / 2;
        curveOffset = baseCurve + (bundleIndex - midIndex) * parallelSpread;
    }

    let pathData: string;
    let labelX: number;
    let labelY: number;

    if (Math.abs(curveOffset) < 1) {
        pathData = `M ${startX},${startY} L ${endX},${endY}`;
        labelX = midX;
        labelY = midY - 5;
    } else {
        const peakX = midX + nx * curveOffset;
        const peakY = midY + ny * curveOffset;
        const c1x = (startX + peakX) / 2;
        const c1y = (startY + peakY) / 2;
        const c2x = (endX   + peakX) / 2;
        const c2y = (endY   + peakY) / 2;
        pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        labelX = (1/8)*startX + (3/8)*c1x + (3/8)*c2x + (1/8)*endX;
        labelY = (1/8)*startY + (3/8)*c1y + (3/8)*c2y + (1/8)*endY;
    }

    const labelDy = curveOffset > 0 ? -5 : curveOffset < 0 ? 5 : -5;

    return (
        <g className={gClasses} onClick={handleEdgeClick}>
            <path d={pathData} markerEnd="url(#arrowhead)" />
            {renderLabel(labelX, labelY, labelDy)}
        </g>
    );
};

export default EdgeComponent;