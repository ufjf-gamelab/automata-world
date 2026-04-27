import React, { useRef } from "react";
import { GAME_COMMANDS } from "../../game/gameConfig";
import type { Node } from "../AutomatonReducer";
import { NODE_WIDTH } from "../AutomatonReducer";
import { useNodeDrag } from "./useNodeDrag";
import styles from "./Node.module.css";

const ACTION_DISPLAY: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.display]),
);

function formatAction(action: string): string {
    return action
        .toLowerCase()
        .split("")
        .map((ch) => ACTION_DISPLAY[ch] ?? ch.toUpperCase())
        .join(" → ");
}

interface NodeProps {
    node: Node;
    onDrag: (id: string, x: number, y: number) => void;
    onClick: (event: React.MouseEvent | React.TouchEvent, node: Node) => void;
    onLongPress?: (event: TouchEvent, node: Node) => void;
    screenToWorld: (clientX: number, clientY: number) => { x: number; y: number };
    isActive: boolean;
    isFailed: boolean;
    /**
     * Chave que muda a cada vez que o autômato entra neste estado.
     * Ao usar como `key` no elemento SVG, força o React a remontar o
     * elemento e reiniciar a animação CSS — necessário para loops.
     */
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

    return (
        <g
            ref={nodeRef}
            className={styles.node}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={handleMouseClick}
        >
            {/*
             * key={isActive ? activeKey : "idle"} força o React a remontar
             * este elemento sempre que activeKey muda enquanto o nó está ativo.
             * Isso reinicia a animação CSS de pulse — essencial para loops,
             * onde o nó permanece ativo entre visitas consecutivas.
             */}
            <circle key={isActive ? activeKey : "idle"} className={outerClasses} r={radius} />
            {node.isFinal && <circle className={styles.inner} r={radius - 6} />}

            {node.action ? (
                <>
                    <text className={styles.actionText} dy="-7">
                        {formatAction(node.action)}
                    </text>
                    <text className={styles.labelText} dy="10">
                        {node.label}
                    </text>
                </>
            ) : (
                <text className={styles.labelText}>{node.label}</text>
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
