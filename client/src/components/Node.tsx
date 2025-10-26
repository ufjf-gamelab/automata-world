// src/components/Node.tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Node } from "./AutomatonEditor"; // Type from parent
import { NODE_WIDTH } from "./AutomatonEditor"; // Constant from parent
import styles from './Node.module.css'; // Import CSS Module

interface NodeProps {
    node: Node;
    onDrag: (id: string, x: number, y: number) => void;
    onClick: (event: React.MouseEvent, node: Node) => void;
    isActive: boolean; // For simulation pulse
    isFailed: boolean; // For simulation fail state
}

const NodeComponent = ({ node, onDrag, onClick, isActive, isFailed }: NodeProps) => {
    const nodeRef = useRef<SVGGElement>(null);
    const radius = NODE_WIDTH / 2;

    // D3 Drag behavior setup
    useEffect(() => {
        if (!nodeRef.current) return;
        const selection = d3.select(nodeRef.current);
        const dragHandler = d3.drag()
            .on("start", function (event) { // Use event from d3
                // Add dragging class from module, raise element
                d3.select(this).raise().classed(styles.dragging, true);
                // Set custom attribute to track drag state (for click vs drag)
                nodeRef.current?.setAttribute("data-dragging", "maybe");
                // Stop event propagation if needed (optional)
                event.sourceEvent.stopPropagation();
            })
            .on("drag", (event) => {
                // Confirm dragging state
                nodeRef.current?.setAttribute("data-dragging", "true");
                // Call parent handler with new coordinates
                onDrag(node.id, event.x, event.y);
            })
            .on("end", function () {
                // Remove dragging class from module
                d3.select(this).classed(styles.dragging, false);
                // Reset drag state after a minimal delay to allow click handler to check
                setTimeout(() => {
                    nodeRef.current?.setAttribute("data-dragging", "false");
                }, 0);
            });
        // Apply drag handler to the node group
        selection.call(dragHandler as any); // Use 'as any' if TS complains about d3 types
    }, [node.id, onDrag]); // Re-run effect if node ID or drag handler changes

    // Click handler distinguishing between click and drag
    const handleClick = (e: React.MouseEvent) => {
        const isDragging = nodeRef.current?.getAttribute("data-dragging") === "true";
        // If it was a drag, stop propagation and do nothing
        if (isDragging) {
            e.stopPropagation();
            return;
        }
        // Otherwise, it's a click, call the parent click handler
        onClick(e, node);
    };

    // Combine CSS module classes based on node state props
    const outerClasses = [
        styles.outer, // Base outer circle style
        node.isInitial ? styles.initial : '', // Style for initial state
        isActive ? styles.active : '',       // Style for active simulation state
        isFailed ? styles.failed : '',       // Style for failed simulation state
    ].filter(Boolean).join(' '); // Filter out empty strings and join

    // Base class for the group element
    const groupClasses = styles.node;

    return (
        <g
            ref={nodeRef}
            className={groupClasses} // Apply base group style
            transform={`translate(${node.x}, ${node.y})`} // Position the group
            onClick={handleClick} // Attach the click handler
        >
            {/* Outer circle representing the node */}
            <circle
                className={outerClasses} // Apply combined state classes
                r={radius} // Set radius
            />

            {/* Inner circle for final states (double border) */}
            {node.isFinal && (
                <circle
                    className={styles.inner} // Apply inner circle style
                    r={radius - 6} // Slightly smaller radius
                />
            )}

            {/* Text label inside the node */}
            <text
                // Text styles are applied via .node text selector in Node.module.css
                // textAnchor="middle" dy="0.3em" are applied by CSS
            >
                {node.label}
            </text>

            {/* Arrow indicating the initial state */}
            {node.isInitial && (
                <path
                    // SVG path data for the arrow line
                    d={`M ${-radius - 25},0 L ${-radius - 8},0`}
                    className={styles.initialArrow} // Style for the initial arrow line
                    // Reference the arrowhead defined in GraphCanvas defs
                    markerEnd="url(#arrowhead-initial)"
                />
            )}
        </g>
    );
};

export default NodeComponent;