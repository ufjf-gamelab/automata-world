import type { IconType } from "react-icons";
import {
    BsArrowUp,
    BsArrowCounterclockwise,
    BsArrowClockwise,
    BsArrowDown,
    BsChevronDoubleUp,
    BsToggleOn,
} from "react-icons/bs";

export type MovementMode = "cardinal" | "relative";

export const MOVEMENT_MODE: MovementMode = "relative";

export interface GameCommand {
    key: string;
    display: string;
    icon: IconType;
    svgSymbol: string;
    word: string;
}

const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", display: "Avançar", icon: BsArrowUp, svgSymbol: "↑", word: "forward" },
    { key: "p", display: "Pular", icon: BsChevronDoubleUp, svgSymbol: "⬆", word: "jump" },
    { key: "b", display: "Botão", icon: BsToggleOn, svgSymbol: "⊕", word: "button" },
    {
        key: "e",
        display: "Girar ↺",
        icon: BsArrowCounterclockwise,
        svgSymbol: "↺",
        word: "turnLeft",
    },
    { key: "d", display: "Girar ↻", icon: BsArrowClockwise, svgSymbol: "↻", word: "turnRight" },
    { key: "t", display: "Meia-volta", icon: BsArrowDown, svgSymbol: "⇅", word: "turnBack" },
];

const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", display: "Avançar", icon: BsArrowUp, svgSymbol: "↑", word: "forward" },
    { key: "p", display: "Pular", icon: BsChevronDoubleUp, svgSymbol: "⬆", word: "jump" },
    { key: "b", display: "Botão", icon: BsToggleOn, svgSymbol: "⊕", word: "button" },
    { key: "n", display: "Norte", icon: BsArrowUp, svgSymbol: "N", word: "north" },
    { key: "s", display: "Sul", icon: BsArrowDown, svgSymbol: "S", word: "south" },
    { key: "l", display: "Leste", icon: BsArrowUp, svgSymbol: "E", word: "east" },
    { key: "o", display: "Oeste", icon: BsArrowDown, svgSymbol: "W", word: "west" },
];

export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "relative" ? COMMANDS_RELATIVE : COMMANDS_CARDINAL;

export const CHAR_TO_COMMAND: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.word]),
);

export const COMMAND_TO_CHAR: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.word, c.key]),
);

export const ACTION_SVG_SYMBOL: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.svgSymbol]),
);
