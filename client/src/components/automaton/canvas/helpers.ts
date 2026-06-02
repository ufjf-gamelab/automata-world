import { GAME_COMMANDS, ACTION_SVG_SYMBOL } from "../../game/gameConfig";
import type { IconType } from "react-icons";

export interface ActionDisplay {
    symbol: string;
    Icon?: IconType;
}

/**
 * Dado um char de ação (ex: "b", "f"), retorna o símbolo Unicode
 * E o ícone react-icons correspondente (se existir).
 */
export function resolveAction(actionKey: string): ActionDisplay {
    const cmd = GAME_COMMANDS.find((c) => c.key === actionKey.toLowerCase());
    return {
        symbol:
            cmd?.svgSymbol ?? ACTION_SVG_SYMBOL[actionKey.toLowerCase()] ?? actionKey.toUpperCase(),
        Icon: cmd?.icon,
    };
}

/**
 * Para ações com múltiplos chars (ex: "fe"), retorna apenas o primeiro
 * já que placas múltiplas ficam sobrepostas. Futuro: renderizar sequência.
 */
export function resolveFirstAction(action: string): ActionDisplay {
    const first = action.toLowerCase()[0];
    return resolveAction(first);
}

export function cubicPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
