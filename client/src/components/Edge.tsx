import React from "react";
import type { Edge, Node } from "./AutomatonEditor";
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

    //SELF-LOOP
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
        // Ponto real em t=0.5 da Bézier cúbica
        const labelX = (1/8)*startX + (3/8)*c1x + (3/8)*c2x + (1/8)*endX;
        const labelY = (1/8)*startY + (3/8)*c1y + (3/8)*c2y + (1/8)*endY;

        return (
            <g className={gClasses} onClick={handleEdgeClick}>
                <path d={pathData} markerEnd="url(#arrowhead)" />
                <text className={styles.edgeLabelText} x={labelX} y={labelY}>
                    {edge.label}
                </text>
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

    // Vetor normal perpendicular à aresta
    const nx = -uy;
    const ny =  ux;

    // Cálculo de curvatura 
    //  Se a aresta reta passa por cima de outro nó → usa avoidanceOffset
    //  Aresta bidirecional ou paralela → usa offset baseado em bundleIndex
    //  Aresta simples e livre → linha reta

    let curveOffset: number;

    if (avoidanceOffset !== 0) {
        // Desvio de colisão tem prioridade e pode ser somado ao offset paralelo
        const parallelBump = (bundleSize > 1)
            ? (bundleIndex - (bundleSize - 1) / 2) * 30
            : 0;
        curveOffset = avoidanceOffset + parallelBump;
    } else if (totalEdgesInRelation === 1) {
        curveOffset = 0; // linha reta — sem paralelas, sem reversas, sem colisão
    } else {
        // Arestas bidirecionais ou paralelas
        // Normais opostos em A↔B garantem curvatura para lados opostos
        // usando sempre +baseCurve (ver comentário em automatonReducer)
        const baseCurve      = hasReverseEdge ? 65 : 35;
        const parallelSpread = 40;
        const midIndex       = (bundleSize - 1) / 2;
        curveOffset = baseCurve + (bundleIndex - midIndex) * parallelSpread;
    }

    //Traçado
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

        // Ponto real da Bézier cúbica em t=0.5:  B(0.5) = ⅛P0 + ⅜P1 + ⅜P2 + ⅛P3
        labelX = (1/8)*startX + (3/8)*c1x + (3/8)*c2x + (1/8)*endX;
        labelY = (1/8)*startY + (3/8)*c1y + (3/8)*c2y + (1/8)*endY;
    }

    return (
        <g className={gClasses} onClick={handleEdgeClick}>
            <path d={pathData} markerEnd="url(#arrowhead)" />
            <text
                className={styles.edgeLabelText}
                x={labelX}
                y={labelY}
                dy={curveOffset > 0 ? -5 : curveOffset < 0 ? 5 : -5}
            >
                {edge.label}
            </text>
        </g>
    );
};

export default EdgeComponent;