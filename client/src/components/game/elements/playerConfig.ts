import characterModel from "../../../assets/glb/character-r.glb?url";

export const PLAYER_CONFIG = {
    modelPath: characterModel,
    animations: {
        idle: "idle",
        walk: "walk",
        jump: "emote-yes",
        interact: "interact-right",
    },

    scale: 0.55,
    yOffset: -0.75,
};
