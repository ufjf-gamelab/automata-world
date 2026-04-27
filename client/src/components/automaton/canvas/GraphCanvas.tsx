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
    recenterTrigger: number;
    linkingState: { sourceNode: Node | null };
    mousePosition: { x: number; y: number };
    sourceNodeForLinking: Node | null;
    activeNodeId: string | null;
    activeEdgeId: string | null;
    failedNodeId: string | null;
    isSimulating: boolean;
    /**
     * Incrementa a cada passo da simulação — usado como activeKey no Node
     * para forçar re-mount da animação em loops.
     */
    activeStepIndex: number;
}

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

function computeAvoidanceOffset(
    src: Node,
    tgt: Node,
    allNodes: Node[],
    threshold = NODE_WIDTH * 1.4,
): number {
    const radius = NODE_WIDTH / 2;
    const dx = tgt.x - src.x,
        dy = tgt.y - src.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ax = src.x + (dx / len) * radius,
        ay = src.y + (dy / len) * radius;
    const bx = tgt.x - (dx / len) * radius,
        by = tgt.y - (dy / len) * radius;

    let maxPenetration = 0,
        sideSign = 1;

    for (const node of allNodes) {
        if (node.id === src.id || node.id === tgt.id) continue;
        const dist = distPointToSegment(node.x, node.y, ax, ay, bx, by);
        if (dist < threshold) {
            const penetration = threshold - dist;
            if (penetration > maxPenetration) {
                maxPenetration = penetration;
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
    activeStepIndex,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .filter((event) => {
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

    useEffect(() => {
        if (recenterTrigger === 0 || !svgRef.current || !zoomRef.current || nodes.length === 0)
            return;
        const svg = d3.select(svgRef.current);
        const svgNode = svg.node();
        if (!svgNode) return;
        const width = svgNode.clientWidth;
        const height = svgNode.clientHeight;
        if (width === 0 || height === 0) return;

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

            <g ref={gRef}>
                <g>
                    {edges.map((edge) => {
                        const sourceNode = nodesById.get(edge.source);
                        const targetNode = nodesById.get(edge.target);
                        if (!sourceNode || !targetNode) return null;

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

                {sourceNodeForLinking && (
                    <path
                        d={`M ${sourceNodeForLinking.x} ${sourceNodeForLinking.y} L ${mousePosition.x} ${mousePosition.y}`}
                        className={styles.ghostLine}
                    />
                )}

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
                            activeKey={activeStepIndex}
                        />
                    ))}
                </g>
            </g>
        </svg>
    );
};

export default GraphCanvas;
