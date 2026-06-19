import React from "react";
import type { Edge, Node } from "../AutomatonReducer";
import ActionSign from "./ActionSign";
import { resolveAction, cubicPoint } from "./helpers";
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
        const lr = 26 + bundleIndex * 24; // step maior → loops mais separados
        const sx = sourceNode.x - 5,
            sy = sourceNode.y - radius;
        const ex = sourceNode.x + 5,
            ey = sourceNode.y - radius;
        const c1x = sx - lr * 2.25,
            c1y = sy - lr * 2.25;
        const c2x = ex + lr * 2.25,
            c2y = ey - lr * 2.25;
        const path = `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`;

        /*
         * Pico real da curva (ponto mais alto do loop).
         * O label e a placa ficam lado a lado NO PICO de cada loop,
         * garantindo separação visual mesmo com múltiplos loops.
         */
        const mx = cubicPoint(0.5, sx, c1x, c2x, ex);
        const my = cubicPoint(0.5, sy, c1y, c2y, ey);
        const GAP = 16;
        const labelX = action ? mx - GAP : mx;
        const labelY = my - 8;
        const signX = mx + GAP;
        const signY = my - 8;

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
    const hasCollision = hasReverseEdge || totalEdgesInRelation > 1 || avoidanceOffset !== 0;
    let pathData: string;
    let labelX = 0,
        labelY = 0,
        signX = 0,
        signY = 0;

    const PERP = 18; // distância perpendicular à aresta
    const TANG = 12; // deslocamento tangencial (lado a lado em colisão)
    const STACK = 11; // deslocamento vertical para empilhar (sem colisão)

    if (Math.abs(curveOffset) < 1) {
        pathData = `M ${startX},${startY} L ${endX},${endY}`;
        // Label acima da aresta, ação abaixo
        labelX = midX - nx * PERP;
        labelY = midY - ny * PERP;
        signX = midX + nx * PERP;
        signY = midY + ny * PERP;
    } else {
        const peakX = midX + nx * curveOffset,
            peakY = midY + ny * curveOffset;
        const c1x = (startX + peakX) / 2,
            c1y = (startY + peakY) / 2;
        const c2x = (endX + peakX) / 2,
            c2y = (endY + peakY) / 2;
        pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        const cx = cubicPoint(0.5, startX, c1x, c2x, endX);
        const cy = cubicPoint(0.5, startY, c1y, c2y, endY);
        const bx = cx + nx * curveSide * PERP;
        const by = cy + ny * curveSide * PERP;
        if (hasCollision && action) {
            // Com colisão: lado a lado ao longo da aresta
            labelX = bx - ux * TANG;
            labelY = by - uy * TANG;
            signX = bx + ux * TANG;
            signY = by + uy * TANG;
        } else {
            // Sem colisão: label fora da curva, ação dentro (abaixo)
            labelX = bx;
            labelY = by;
            signX = cx - nx * curveSide * PERP;
            signY = cy - ny * curveSide * PERP;
        }
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
