import React, { useRef } from "react";
import type { Node } from "../AutomatonReducer";
import { NODE_WIDTH } from "../AutomatonReducer";
import { useNodeDrag } from "./useNodeDrag";
import ActionSign from "./ActionSign";
import { resolveFirstAction } from "./helpers";
import styles from "./Node.module.css";

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

    const action = node.action ? resolveFirstAction(node.action) : null;

    // Placa posicionada abaixo do círculo com folga de 5px
    const SIGN_H = 22;
    const GAP = 5;
    const signY = radius + GAP + SIGN_H / 2;

    return (
        <g
            ref={nodeRef}
            className={styles.node}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={handleMouseClick}
        >
            <circle key={isActive ? activeKey : "idle"} className={outerClasses} r={radius} />
            {node.isFinal && <circle className={styles.inner} r={radius - 6} />}

            {/* Label do estado — centralizado no círculo */}
            <text className={styles.labelText} textAnchor="middle" dominantBaseline="central">
                {node.label}
            </text>

            {/* Placa de ação ABAIXO do círculo */}
            {action && (
                <ActionSign
                    x={0}
                    y={signY}
                    symbol={action.symbol}
                    Icon={action.Icon}
                    bgClass={styles.signBg}
                    textClass={styles.signText}
                />
            )}

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
