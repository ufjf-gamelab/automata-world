import { useRef } from "react";
import styles from "./CompassRose.module.css";

// playerRotation → ângulo do ponteiro no SVG (0° = topo = Norte)
const PLAYER_ANGLE = [180, 90, 0, 270]; // Sul, Leste, Norte, Oeste

interface CompassRoseProps {
    rotationIndex: number;
    innerRef: React.RefObject<SVGGElement | null>;
}

export default function CompassRose({ rotationIndex, innerRef }: CompassRoseProps) {
    const playerAngle = PLAYER_ANGLE[rotationIndex] ?? 0;

    return (
        <div className={styles.compass}>
            <svg viewBox="0 0 80 80" width="80" height="80">
                {/* Grupo inteiro rotacionado pelo CameraWatcher via innerRef */}
                <g ref={innerRef}>
                    {/* Anel */}
                    <circle
                        cx="40"
                        cy="40"
                        r="38"
                        fill="rgba(0,0,0,0.55)"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                    />

                    {/* Labels cardinais */}
                    <text
                        x="40"
                        y="10"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        N
                    </text>
                    <text
                        x="40"
                        y="72"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        S
                    </text>
                    <text
                        x="70"
                        y="41"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        L
                    </text>
                    <text
                        x="10"
                        y="41"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        O
                    </text>

                    {/* Ponteiro do jogador — ângulo fixo no espaço do mundo */}
                    <g transform={`rotate(${playerAngle}, 40, 40)`}>
                        <polygon points="40,16 44,40 40,36 36,40" fill="#ff5252" />
                        <polygon points="40,64 44,40 40,44 36,40" fill="rgba(255,255,255,0.4)" />
                    </g>

                    {/* Centro */}
                    <circle cx="40" cy="40" r="3" fill="white" />
                </g>
            </svg>
        </div>
    );
}
