import React, { useRef } from "react";
import { ACTION_SVG_SYMBOL } from "../../game/gameConfig";
import type { Node } from "../AutomatonReducer";
import { NODE_WIDTH } from "../AutomatonReducer";
import { useNodeDrag } from "./useNodeDrag";
import styles from "./Node.module.css";

function formatActionSymbols(action: string): string {
    return action
        .toLowerCase()
        .split("")
        .map((ch) => ACTION_SVG_SYMBOL[ch] ?? ch.toUpperCase())
        .join(" ");
}

interface NodeProps {
    node: Node;
    onDrag: (id: string, x: number, y: number) => void;
    onClick: (event: React.MouseEvent | React.TouchEvent, node: Node) => void;
    onLongPress?: (event: TouchEvent, node: Node) => void;
    screenToWorld: (clientX: number, clientY: number) => { x: number; y: number };
    isActive: boolean;
    isFailed: boolean;
    activeKey: number;
}

const NodeComponent = ({
    node,
    onDrag,
    onClick,
    onLongPress,
    screenToWorld,
    isActive,
    isFailed,
    activeKey,
}: NodeProps) => {
    const nodeRef = useRef<SVGGElement>(null);
    const radius = NODE_WIDTH / 2;

    const onDragRef = useRef(onDrag);
    const onClickRef = useRef(onClick);
    const onLongPressRef = useRef(onLongPress);
    const screenToWorldRef = useRef(screenToWorld);
    const nodeDataRef = useRef(node);

    React.useEffect(() => {
        onDragRef.current = onDrag;
    }, [onDrag]);
    React.useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);
    React.useEffect(() => {
        onLongPressRef.current = onLongPress;
    }, [onLongPress]);
    React.useEffect(() => {
        screenToWorldRef.current = screenToWorld;
    }, [screenToWorld]);
    React.useEffect(() => {
        nodeDataRef.current = node;
    }, [node]);

    useNodeDrag({
        nodeRef,
        nodeDataRef,
        onDragRef,
        onClickRef,
        onLongPressRef,
        screenToWorldRef,
        draggingClass: styles.dragging,
    });

    const handleMouseClick = (e: React.MouseEvent) => {
        if (nodeRef.current?.getAttribute("data-drag") === "yes") {
            e.stopPropagation();
            return;
        }
        onClickRef.current(e, nodeDataRef.current);
    };

    const outerClasses = [
        styles.outer,
        node.isInitial ? styles.initial : "",
        isActive ? styles.active : "",
        isFailed ? styles.failed : "",
    ]
        .filter(Boolean)
        .join(" ");

    const actionSymbol = node.action ? formatActionSymbols(node.action) : null;

    // Dimensões do badge de ação acima do nó
    const badgeW = actionSymbol ? Math.max(26, actionSymbol.length * 11 + 12) : 0;
    const badgeH = 20;
    const badgeY = -radius - badgeH - 2; // acima do círculo com folga

    return (
        <g
            ref={nodeRef}
            className={styles.node}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={handleMouseClick}
        >
            <circle key={isActive ? activeKey : "idle"} className={outerClasses} r={radius} />
            {node.isFinal && <circle className={styles.inner} r={radius - 6} />}

            {actionSymbol && (
                /* Badge com fundo pill posicionado acima do círculo */
                <g>
                    <rect
                        className={styles.actionBadgeBg}
                        x={-badgeW / 2}
                        y={badgeY}
                        width={badgeW}
                        height={badgeH}
                        rx={5}
                        ry={5}
                    />
                    <text
                        className={styles.actionText}
                        x={0}
                        y={badgeY + badgeH / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                    >
                        {actionSymbol}
                    </text>
                </g>
            )}

            {/* Label do estado — centralizado no círculo */}
            <text className={styles.labelText} textAnchor="middle" dominantBaseline="central">
                {node.label}
            </text>

            {node.isInitial && (
                <path
                    d={`M ${-radius - 25},0 L ${-radius - 8},0`}
                    className={styles.initialArrow}
                    markerEnd="url(#arrowhead-initial)"
                />
            )}
        </g>
    );
};

export default NodeComponent;
