// src/components/GraphCanvas.tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import NodeComponent from "./Node";
import EdgeComponent from "./Edge";
import type { Node, Edge } from "./AutomatonEditor"; // Types from parent
import { NODE_WIDTH, NODE_HEIGHT } from "./AutomatonEditor"; // Constants from parent
import styles from "./GraphCanvas.module.css"; // Import CSS Module for GraphCanvas

interface GraphCanvasProps {
    nodes: Node[];
    edges: Edge[];
    // Removed svgWidth/svgHeight as SVG is now 100%
    onNodeDrag: (id: string, x: number, y: number) => void;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
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
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
    nodes,
    edges,
    onNodeDrag,
    onNodeClick,
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

    // Effect to initialize Zoom behavior
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform.toString());
            });
        svg.call(zoom).on("dblclick.zoom", null);
        zoomRef.current = zoom;
    }, []);

    // Effect for Recenter/Zoom-to-Fit
    useEffect(() => {
        if (recenterTrigger === 0) return; // Skip initial mount if trigger starts at 0
        if (!svgRef.current || !gRef.current || !zoomRef.current || nodes.length === 0) return;

        const svg = d3.select(svgRef.current);
        const zoom = zoomRef.current;
        const svgNode = svg.node();
        if (!svgNode) return;

        const width = svgNode.clientWidth;
        const height = svgNode.clientHeight;
        if (width === 0 || height === 0) return; // Avoid division by zero if SVG not rendered

        // Calculate bounding box of nodes
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        nodes.forEach((node) => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        });

        // Add padding based on node size
        const gWidth = maxX - minX + NODE_WIDTH;
        const gHeight = maxY - minY + NODE_HEIGHT;
        const gCenterX = minX + gWidth / 2 - NODE_WIDTH / 2; // Adjusted center calculation
        const gCenterY = minY + gHeight / 2 - NODE_HEIGHT / 2; // Adjusted center calculation

        if (gWidth === 0 || gHeight === 0) return; // Avoid division by zero for single node

        const scale = Math.min(width / gWidth, height / gHeight) * 0.6; // Scale factor (0.6 for more zoom out)
        const translateX = width / 2 - gCenterX * scale;
        const translateY = height / 2 - gCenterY * scale;
        const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

        // Apply smooth transition
        (svg.transition().duration(750) as any).call(zoom.transform, transform);
    }, [recenterTrigger]); // Depends only on the trigger

    // Mouse Move handler to calculate world coordinates
    const handleMouseMove = (event: React.MouseEvent) => {
        if (!svgRef.current) return;
        const svg = svgRef.current;
        const svgRect = svg.getBoundingClientRect();
        const screenX = event.clientX - svgRect.left;
        const screenY = event.clientY - svgRect.top;
        const transform = d3.zoomTransform(svg); // Get current zoom/pan
        const [worldX, worldY] = transform.invert([screenX, screenY]); // Convert screen to SVG world coords
        onSvgMouseMove(worldX, worldY); // Pass world coords to parent
    };

    // Map nodes by ID for faster lookup when rendering edges
    const nodesById = new Map(nodes.map((node) => [node.id, node]));

    return (
        <svg
            ref={svgRef}
            width="100%" // Occupy full container width
            height="100%" // Occupy full container height
            onMouseMove={handleMouseMove}
            className={styles.graphCanvas} // Apply optional base style from module
        >
            <defs>
                {/* Standard Arrow Head */}
                <marker
                    id="arrowhead"
                    viewBox="0 0 10 10"
                    refX={10} // Point towards the end line
                    refY={5}
                    orient="auto"
                    markerWidth={6}
                    markerHeight={6}
                >
                    {/* Use global class 'arrow-head' from global.css */}
                    <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head" />
                </marker>
                {/* Arrow Head for Initial State Pointer */}
                <marker
                    id="arrowhead-initial"
                    viewBox="-0 -5 10 10"
                    refX={10} // Point towards the end line
                    refY={0}
                    orient="auto"
                    markerWidth={6}
                    markerHeight={6}
                >
                    <path d="M 0,-5 L 10 ,0 L 0,5" fill="#28a745" /> {/* Green fill */}
                </marker>
            </defs>

            {/* Main group transformed by zoom/pan */}
            <g ref={gRef}>
                {/* Edges rendered first (underneath nodes) */}
                <g>
                    {edges.map((edge) => {
                        const sourceNode = nodesById.get(edge.source);
                        const targetNode = nodesById.get(edge.target);
                        // Skip rendering if nodes aren't found (e.g., during deletion)
                        if (!sourceNode || !targetNode) return null;

                        // Calculate bundling info for EdgeComponent
                        const parallelEdges = edges.filter((e) => e.source === edge.source && e.target === edge.target);
                        const reverseEdges = edges.filter((e) => e.source === edge.target && e.target === edge.source);
                        const bundleSize = parallelEdges.length;
                        const bundleIndex = parallelEdges.findIndex((e) => e.id === edge.id);
                        const hasReverse = reverseEdges.length > 0;
                        const totalEdgesInRelation = bundleSize + reverseEdges.length;
                        // Determine main curve for consistent bending direction
                        const isMainCurve = edge.source < edge.target;

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
                                isMainCurve={isMainCurve}
                                onEdgeClick={onEdgeClick}
                            />
                        );
                    })}
                </g>

                {/* Ghost line for linking mode */}
                {sourceNodeForLinking && (
                    <path
                        d={`M ${sourceNodeForLinking.x} ${sourceNodeForLinking.y} L ${mousePosition.x} ${mousePosition.y}`}
                        // Use class from GraphCanvas's CSS Module
                        className={styles.ghostLine}
                    />
                )}

                {/* Nodes rendered last (on top of edges) */}
                <g>
                    {nodes.map((node) => (
                        <NodeComponent
                            key={node.id}
                            node={node}
                            onDrag={onNodeDrag}
                            onClick={onNodeClick}
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
