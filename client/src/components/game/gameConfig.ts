// ─── Movement mode ────────────────────────────────────────────────────────────
// Switch here to change how the player rotates:
//   "cardinal" → absolute compass directions (N, S, E, W)
//   "relative" → relative turns (Left, Right, Back)
export type MovementMode = "cardinal" | "relative";
export const MOVEMENT_MODE: MovementMode = "cardinal";

// ─── Command descriptor ───────────────────────────────────────────────────────
// key     → internal command letter sent to the game reducer
// display → human-readable name shown in modals and edge labels
export interface GameCommand {
    key: string;
    display: string;
}

const COMMANDS_CARDINAL: GameCommand[] = [
    { key: "f", display: "Forward" },
    { key: "p", display: "Jump" },
    { key: "b", display: "Button" },
    { key: "n", display: "North" },
    { key: "s", display: "South" },
    { key: "l", display: "East" },
    { key: "o", display: "West" },
];

const COMMANDS_RELATIVE: GameCommand[] = [
    { key: "f", display: "Forward" },
    { key: "p", display: "Jump" },
    { key: "b", display: "Button" },
    { key: "e", display: "Turn Left" },
    { key: "d", display: "Turn Right" },
    { key: "t", display: "Turn Back" },
];

export const GAME_COMMANDS: GameCommand[] =
    MOVEMENT_MODE === "cardinal" ? COMMANDS_CARDINAL : COMMANDS_RELATIVE;
