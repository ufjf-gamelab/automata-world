// src/components/Edge.tsx
import React from "react";
import type { Edge, Node } from "./AutomatonEditor";
import styles from "./Edge.module.css"; // Import module

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
    isMainCurve: boolean;
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
    isMainCurve,
}: EdgeProps) => {
    const radius = NODE_WIDTH / 2;

    const handleEdgeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdgeClick(e, edge);
    };

    const gClasses = [
        styles.edge,
        isActive ? styles.active : "", // Assuming 'active' class exists in module
        isActive && isSimulating ? styles.simulating : "", // Assuming 'simulating' class exists
    ]
        .filter(Boolean)
        .join(" ");
    // --- 1. LÓGICA DE SELF-LOOP (CURVA DO USUÁRIO RESTAURADA) ---
    if (sourceNode.id === targetNode.id) {
        // Raio do arco (aumenta para cada loop)
        const loopRadius = 25 + bundleIndex * 10; // 25, 35, 45...

        // Pontos de início e fim ligeiramente separados
        const startX = sourceNode.x - 5;
        const startY = sourceNode.y - radius;
        const endX = sourceNode.x + 5;
        const endY = sourceNode.y - radius;

        // Pontos de controle com o multiplicador 2.25 (SUA LÓGICA)
        const c1x = startX - loopRadius * 2.25;
        const c1y = startY - loopRadius * 2.25;
        const c2x = endX + loopRadius * 2.25;
        const c2y = endY - loopRadius * 2.25;

        const pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;

        // Posição do label (ajustada para SUA curva)
        const labelY = c1y + 15; // Usando c1y como referência, conforme seu código

        return (
            <g className={gClasses} onClick={handleEdgeClick}>
                <path d={pathData} markerEnd="url(#arrowhead)" />
                <text className={styles.edgeLabelText} x={sourceNode.x} y={labelY}>
                    {edge.label}
                </text>
            </g>
        );
    }

    // --- 2. LÓGICA DE ARESTA NORMAL (V6 - Bézier Cúbica) ---
    // (Esta parte permanece a mesma)
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

    let curveOffset: number;

    if (totalEdgesInRelation === 1) {
        curveOffset = 0; // Reta
    } else {
        let baseCurve: number;
        if (hasReverseEdge) {
            baseCurve = isMainCurve ? 25 : -25;
        } else {
            baseCurve = 20;
        }
        const parallelSpread = 30; // Espaçamento
        const midIndex = (bundleSize - 1) / 2;
        const parallelOffset = (bundleIndex - midIndex) * parallelSpread;
        curveOffset = baseCurve + parallelOffset;
    }
    // --- Fim da Lógica de Curvatura ---

    let pathData: string;
    let labelX: number;
    let labelY: number;

    if (Math.abs(curveOffset) < 1) {
        // --- Desenha uma LINHA RETA ---
        pathData = `M ${startX},${startY} L ${endX},${endY}`;
        labelX = midX;
        labelY = midY - 5;
    } else {
        // --- Desenha uma LINHA CURVA (Bézier Cúbica) ---
        const nx = -uy;
        const ny = ux;
        const peakX = midX + nx * curveOffset;
        const peakY = midY + ny * curveOffset;
        const c1x = (startX + peakX) / 2;
        const c1y = (startY + peakY) / 2;
        const c2x = (endX + peakX) / 2;
        const c2y = (endY + peakY) / 2;
        pathData = `M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
        labelX = peakX;
        labelY = peakY;
    }

    return (
        <g className={gClasses} onClick={handleEdgeClick}>
            <path d={pathData} markerEnd="url(#arrowhead)" />
            <text
                className={styles.edgeLabelText} // Use module class
                x={labelX}
                y={labelY}
                dy={curveOffset > 0 ? -5 : 5}
            >
                {edge.label}
            </text>
        </g>
    );
};

export default EdgeComponent;
