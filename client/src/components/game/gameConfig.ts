export type MovementMode = "cardinal" | "relative";
export const MOVEMENT_MODE: MovementMode = "cardinal";

export interface GameCommand {
    key: string;
    display: string;
    /** Palavra completa usada como identificador de animação no Player */
    word: string;
}

const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", display: "Forward", word: "forward" },
    { key: "p", display: "Jump",    word: "jump"    },
    { key: "b", display: "Button",  word: "button"  },
    { key: "n", display: "North",   word: "north"   },
    { key: "s", display: "South",   word: "south"   },
    { key: "l", display: "East",    word: "east"    },
    { key: "o", display: "West",    word: "west"    },
];

const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", display: "Forward",    word: "forward"  },
    { key: "p", display: "Jump",       word: "jump"     },
    { key: "b", display: "Button",     word: "button"   },
    { key: "e", display: "Turn Left",  word: "turnLeft" },
    { key: "d", display: "Turn Right", word: "turnRight"},
    { key: "t", display: "Turn Back",  word: "turnBack" },
];

export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "cardinal" ? COMMANDS_CARDINAL : COMMANDS_RELATIVE;

/** Converte char interno (ex: "f") para palavra de animação (ex: "forward") */
export const CHAR_TO_COMMAND: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.key, c.word]),
);

/** Converte palavra de animação de volta para char interno */
export const COMMAND_TO_CHAR: Record<string, string> = Object.fromEntries(
    GAME_COMMANDS.map((c) => [c.word, c.key]),
);