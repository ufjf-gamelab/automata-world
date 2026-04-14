/**
 * GraphCanvas.tsx — Canvas SVG interativo do autômato finito
 *
 * Responsável por renderizar todos os nós e arestas do grafo em um SVG
 * com suporte a zoom, pan e drag. Usa a biblioteca D3 exclusivamente para
 * zoom/pan — os cliques e drags dos nós são tratados pelos próprios componentes.
 *
 * Funcionalidades:
 *   - Zoom e pan via scroll/pinch (D3 ZoomBehavior)
 *   - Zoom-to-fit animado ao clicar em "Reorganizar"
 *   - Linha tracejada fantasma ao conectar dois nós
 *   - Desvio automático de arestas que passariam por cima de outros nós
 *   - Suporte a arestas paralelas e bidirecionais com curvas separadas
 */
import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import NodeComponent from "./Node";
import EdgeComponent from "./Edge";
import type { Node, Edge } from "../AutomatonReducer";
import { NODE_WIDTH, NODE_HEIGHT } from "../AutomatonReducer";
import styles from "./GraphCanvas.module.css";

interface GraphCanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodeDrag: (id: string, x: number, y: number) => void;
    onNodeClick: (event: React.MouseEvent | React.TouchEvent, node: Node) => void;
    onNodeLongPress?: (event: TouchEvent, node: Node) => void;
    onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
    onSvgMouseMove: (x: number, y: number) => void;
    recenterTrigger: number; // incrementar este valor dispara o zoom-to-fit
    linkingState: { sourceNode: Node | null };
    mousePosition: { x: number; y: number };
    sourceNodeForLinking: Node | null;
    activeNodeId: string | null; // nó destacado durante a simulação
    activeEdgeId: string | null; // aresta destacada durante a simulação
    failedNodeId: string | null; // nó marcado em vermelho quando a simulação rejeita
    isSimulating: boolean;
}

/**
 * Distância de um ponto P ao segmento de reta AB.
 * Usada para detectar se um nó está "no caminho" de uma aresta.
 */
function distPointToSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
): number {
    const dx = bx - ax,
        dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - ax, py - ay);
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Calcula o desvio lateral necessário para que uma aresta evite passar
 * por cima de outros nós. Retorna 0 se a aresta está livre; caso contrário,
 * retorna um offset positivo ou negativo dependendo do lado que tem mais espaço.
 */
function computeAvoidanceOffset(
    src: Node,
    tgt: Node,
    allNodes: Node[],
    threshold = NODE_WIDTH * 1.4,
): number {
    const radius = NODE_WIDTH / 2;
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ax = src.x + (dx / len) * radius;
    const ay = src.y + (dy / len) * radius;
    const bx = tgt.x - (dx / len) * radius;
    const by = tgt.y - (dy / len) * radius;

    let maxPenetration = 0;
    let sideSign = 1;

    for (const node of allNodes) {
        if (node.id === src.id || node.id === tgt.id) continue;
        const dist = distPointToSegment(node.x, node.y, ax, ay, bx, by);
        if (dist < threshold) {
            const penetration = threshold - dist;
            if (penetration > maxPenetration) {
                maxPenetration = penetration;
                // Produto vetorial determina de qual lado o nó está em relação à aresta
                const cross = (bx - ax) * (node.y - ay) - (by - ay) * (node.x - ax);
                sideSign = cross > 0 ? -1 : 1;
            }
        }
    }

    if (maxPenetration === 0) return 0;
    return sideSign * Math.max(70, maxPenetration * 1.6);
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
    nodes,
    edges,
    onNodeDrag,
    onNodeClick,
    onNodeLongPress,
    onEdgeClick,
    onSvgMouseMove,
    recenterTrigger,
    sourceNodeForLinking,
    mousePosition,
    activeNodeId,
    activeEdgeId,
    failedNodeId,
    isSimulating,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    // Configura o zoom/pan via D3 uma única vez ao montar o componente
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
                // Ignora eventos de toque que vêm de dentro de um nó (drag do nó tem prioridade)
                if (event.type === "touchstart" || event.type === "touchmove") {
                    const target = event.target as Element;
                    if (target.closest?.("." + styles.nodeGroup)) return false;
                }
                return !event.button;
            })
            .on("zoom", (event) => g.attr("transform", event.transform.toString()));

        svg.call(zoom).on("dblclick.zoom", null);
        zoomRef.current = zoom;
    }, []);

    // Zoom-to-fit animado: disparado sempre que recenterTrigger muda
    useEffect(() => {
        if (recenterTrigger === 0 || !svgRef.current || !zoomRef.current || nodes.length === 0)
            return;
        const svg = d3.select(svgRef.current);
        const svgNode = svg.node();
        if (!svgNode) return;
        const width = svgNode.clientWidth;
        const height = svgNode.clientHeight;
        if (width === 0 || height === 0) return;

        // Calcula o bounding box de todos os nós
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        nodes.forEach((n) => {
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x);
            maxY = Math.max(maxY, n.y);
        });

        const gWidth = maxX - minX + NODE_WIDTH * 2;
        const gHeight = maxY - minY + NODE_HEIGHT * 2;
        if (gWidth === 0 || gHeight === 0) return;

        const gCenterX = minX + (maxX - minX) / 2;
        const gCenterY = minY + (maxY - minY) / 2;
        const scale = Math.min(width / gWidth, height / gHeight) * 0.75;
        const transform = d3.zoomIdentity
            .translate(width / 2 - gCenterX * scale, height / 2 - gCenterY * scale)
            .scale(scale);

        (svg.transition().duration(750) as any).call(zoomRef.current.transform, transform);
    }, [recenterTrigger]);

    /**
     * Converte coordenadas da tela (pixels) para o espaço do grafo
     * levando em conta o zoom e pan atuais. Necessário para o drag por toque.
     */
    const screenToWorld = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        const transform = d3.zoomTransform(svgRef.current);
        const [x, y] = transform.invert([clientX - rect.left, clientY - rect.top]);
        return { x, y };
    }, []);

    const handleMouseMove = (event: React.MouseEvent) => {
        const { x, y } = screenToWorld(event.clientX, event.clientY);
        onSvgMouseMove(x, y);
    };

    // Mapa de nós por id para lookup O(1) na renderização das arestas
    const nodesById = new Map(nodes.map((n) => [n.id, n]));

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            onMouseMove={handleMouseMove}
            className={styles.graphCanvas}
        >
            <defs>
                {/* Ponta de seta padrão para arestas comuns */}
                <marker
                    id="arrowhead"
                    viewBox="0 0 10 10"
                    refX={10}
                    refY={5}
                    orient="auto"
                    markerWidth={6}
                    markerHeight={6}
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head" />
                </marker>
                {/* Ponta de seta verde para a seta de "estado inicial" */}
                <marker
                    id="arrowhead-initial"
                    viewBox="-0 -5 10 10"
                    refX={10}
                    refY={0}
                    orient="auto"
                    markerWidth={6}
                    markerHeight={6}
                >
                    <path d="M 0,-5 L 10,0 L 0,5" fill="#28a745" />
                </marker>
            </defs>

            {/* Grupo principal — recebe a transformação de zoom/pan do D3 */}
            <g ref={gRef}>
                {/* Arestas são renderizadas antes dos nós para ficarem atrás deles */}
                <g>
                    {edges.map((edge) => {
                        const sourceNode = nodesById.get(edge.source);
                        const targetNode = nodesById.get(edge.target);
                        if (!sourceNode || !targetNode) return null;

                        // Calcula informações de agrupamento para arestas paralelas e bidirecionais
                        const parallelEdges = edges.filter(
                            (e) => e.source === edge.source && e.target === edge.target,
                        );
                        const reverseEdges = edges.filter(
                            (e) => e.source === edge.target && e.target === edge.source,
                        );
                        const bundleSize = parallelEdges.length;
                        const bundleIndex = parallelEdges.findIndex((e) => e.id === edge.id);
                        const hasReverse = reverseEdges.length > 0;
                        const totalEdgesInRelation = bundleSize + reverseEdges.length;
                        const avoidanceOffset = computeAvoidanceOffset(
                            sourceNode,
                            targetNode,
                            nodes,
                        );

                        return (
                            <EdgeComponent
                                key={edge.id}
                                edge={edge}
                                sourceNode={sourceNode}
                                targetNode={targetNode}
                                isActive={edge.id === activeEdgeId}
                                isSimulating={isSimulating}
                                totalEdgesInRelation={totalEdgesInRelation}
                                bundleSize={bundleSize}
                                bundleIndex={bundleIndex}
                                hasReverseEdge={hasReverse}
                                avoidanceOffset={avoidanceOffset}
                                onEdgeClick={onEdgeClick}
                            />
                        );
                    })}
                </g>

                {/* Linha tracejada que acompanha o mouse no modo de conexão entre nós */}
                {sourceNodeForLinking && (
                    <path
                        d={`M ${sourceNodeForLinking.x} ${sourceNodeForLinking.y} L ${mousePosition.x} ${mousePosition.y}`}
                        className={styles.ghostLine}
                    />
                )}

                {/* Nós são renderizados por cima das arestas */}
                <g>
                    {nodes.map((node) => (
                        <NodeComponent
                            key={node.id}
                            node={node}
                            onDrag={onNodeDrag}
                            onClick={onNodeClick}
                            onLongPress={onNodeLongPress}
                            screenToWorld={screenToWorld}
                            isActive={node.id === activeNodeId}
                            isFailed={node.id === failedNodeId}
                        />
                    ))}
                </g>
            </g>
        </svg>
    );
};

export default GraphCanvas;
