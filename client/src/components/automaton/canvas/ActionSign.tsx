/**
 * ActionSign.tsx
 *
 * Badge "placa de trânsito" no canvas SVG do autômato.
 *
 * Quando `Icon` é fornecido, renderiza o ícone react-icons via <foreignObject>,
 * que permite HTML/React dentro do SVG — exibe exatamente o mesmo ícone
 * que aparece nos botões do modal de seleção de ação.
 *
 * Quando apenas `symbol` é fornecido (fallback), usa <text> Unicode.
 */
import React from "react";
import type { IconType } from "react-icons";

const W = 28; // largura da placa
const H = 22; // altura da placa
const RADIUS = 6; // border-radius
const ICON_SZ = 14; // tamanho do ícone dentro da placa

interface ActionSignProps {
    x: number;
    y: number;
    symbol: string;
    Icon?: IconType;
    bgClass: string;
    textClass: string;
}

const ActionSign: React.FC<ActionSignProps> = ({ x, y, symbol, Icon, bgClass, textClass }) => {
    const textW = Math.max(W, symbol.length * 9 + 16);
    const width = Icon ? W : textW;

    return (
        <g>
            {/* Fundo da placa */}
            <rect
                className={bgClass}
                x={x - width / 2}
                y={y - H / 2}
                width={width}
                height={H}
                rx={RADIUS}
                ry={RADIUS}
            />

            {Icon ? (
                /*
                 * foreignObject — permite renderizar o componente react-icons
                 * real dentro do SVG, idêntico ao ícone do modal HTML.
                 * O div interno usa flexbox para centralizar o ícone.
                 */
                <foreignObject
                    x={x - width / 2}
                    y={y - H / 2}
                    width={width}
                    height={H}
                    style={{ overflow: "visible" }}
                >
                    <div
                        // @ts-expect-error — xmlns é necessário no foreignObject para compatibilidade
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fill: "#ffffff",
                            pointerEvents: "none",
                        }}
                    >
                        {/* Força fill/color branco mesmo quando o tema sobrescreve */}
                        <style>{`
                            .action-sign-icon svg,
                            .action-sign-icon path,
                            .action-sign-icon circle,
                            .action-sign-icon rect {
                                color: #ffffff !important;
                                fill: #ffffff !important;
                                stroke: none !important;
                            }
                        `}</style>
                        <span className="action-sign-icon">
                            <Icon size={ICON_SZ} color="#ffffff" />
                        </span>
                    </div>
                </foreignObject>
            ) : (
                /* Fallback Unicode para teclas sem ícone dedicado */
                <text
                    className={textClass}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {symbol}
                </text>
            )}
        </g>
    );
};

export default ActionSign;
