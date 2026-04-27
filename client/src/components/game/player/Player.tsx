import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, MathUtils, Vector3, LoopOnce, LoopRepeat, LoadingManager } from "three";
import type { PlayerProps } from "./playerTypes";
import { PLAYER_CONFIG } from "./playerConfig";

/**
 * Agrupa os comandos por categoria de animação.
 * Todos os itens de cada grupo disparam a mesma animação.
 */
const MOVE_COMMANDS = [
    "forward",
    "north",
    "south",
    "east",
    "west",
    "turnLeft",
    "turnRight",
    "turnBack",
];
const JUMP_COMMANDS = ["jump"];
const BUTTON_COMMANDS = ["button"];

function isMove(cmd: string) {
    return MOVE_COMMANDS.includes(cmd);
}
function isJump(cmd: string) {
    return JUMP_COMMANDS.includes(cmd);
}
function isButton(cmd: string) {
    return BUTTON_COMMANDS.includes(cmd);
}

export default function Player({
    gridPosition,
    rotationIndex,
    blockHeight = 0,
    stepIndex = 0,
    command = "",
}: PlayerProps) {
    const groupRef = useRef<Group>(null);

    const gltf = useLoader(GLTFLoader, PLAYER_CONFIG.modelPath, (loader) => {
        const manager = new LoadingManager();
        manager.setURLModifier((url) => {
            if (url.includes("texture-r")) return PLAYER_CONFIG.texturePath;
            return url;
        });
        loader.manager = manager;
    });

    const { scene, animations } = gltf;
    const { actions } = useAnimations(animations, groupRef);
    const currentAnimRef = useRef<string>("");
    const isLockedRef = useRef(false);
    const hopProgress = useRef(0);
    const [isHopping, setIsHopping] = useState(false);

    const { animations: ANIMS, scale, yOffset } = PLAYER_CONFIG;

    const targetX = gridPosition[0];
    const targetZ = gridPosition[1];
    const targetY = blockHeight * 0.5 + yOffset;
    const targetRotY = rotationIndex * (Math.PI / 2);

    const playAnim = (name: string | null, once = false) => {
        if (!name) return;
        const next = actions[name];
        if (!next) return;
        if (!once && currentAnimRef.current === name) return;
        const prev = actions[currentAnimRef.current];
        next.reset();
        next.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
        next.clampWhenFinished = false;
        if (prev && prev !== next) next.crossFadeFrom(prev, 0.15, true);
        next.play();
        currentAnimRef.current = name;
    };

    useEffect(() => {
        const t = setTimeout(() => playAnim(ANIMS.idle), 80);
        return () => clearTimeout(t);
    }, [actions]);

    useEffect(() => {
        if (stepIndex === 0) {
            currentAnimRef.current = "";
            isLockedRef.current = false;
            setIsHopping(false);
            hopProgress.current = 0;
            setTimeout(() => playAnim(ANIMS.idle), 80);
            return;
        }

        if (isLockedRef.current) return;

        const cmd = command.toLowerCase();

        if (isMove(cmd)) {
            /*
             * Movimentos e rotações → animação de walk.
             * O timeout de retorno ao idle usa ~950ms, alinhado com ANIM_DURATION["f"]
             * definido em useSimulation.ts.
             * Para ajustar, altere o valor abaixo e o correspondente em ANIM_DURATION.
             */
            playAnim(ANIMS.walk);
            setTimeout(() => {
                if (!isLockedRef.current) playAnim(ANIMS.idle);
            }, 950);
        } else if (isJump(cmd)) {
            isLockedRef.current = true;
            if (ANIMS.jump) {
                const jumpAction = actions[ANIMS.jump];
                if (jumpAction) {
                    jumpAction.reset();
                    jumpAction.setLoop(LoopOnce, 1);
                    jumpAction.clampWhenFinished = true;
                    const prev = actions[currentAnimRef.current];
                    if (prev && prev !== jumpAction) jumpAction.crossFadeFrom(prev, 0.1, true);
                    jumpAction.play();
                    currentAnimRef.current = ANIMS.jump;
                }
                const dur = (actions[ANIMS.jump]?.getClip().duration ?? 0.7) * 1000;
                setTimeout(() => {
                    isLockedRef.current = false;
                    playAnim(ANIMS.idle);
                }, dur - 100);
            } else {
                setTimeout(() => {
                    isLockedRef.current = false;
                    playAnim(ANIMS.idle);
                }, 600);
            }
        } else if (isButton(cmd)) {
            setIsHopping(true);
            hopProgress.current = 0;
            isLockedRef.current = true;
            playAnim(ANIMS.interact, true);
            const dur = (actions[ANIMS.interact!]?.getClip().duration ?? 0.8) * 1000;
            setTimeout(() => {
                isLockedRef.current = false;
                playAnim(ANIMS.idle);
            }, dur - 100);
        }
    }, [stepIndex, command]);

    // Teleporte apenas em mudanças bruscas (troca de fase — distância > 3)
    useEffect(() => {
        if (!groupRef.current) return;
        const dist = new Vector3(targetX, targetY, targetZ).distanceTo(groupRef.current.position);
        if (dist > 3) {
            groupRef.current.position.set(targetX, targetY, targetZ);
            groupRef.current.rotation.y = targetRotY;
        }
    }, [targetX, targetY, targetZ]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        /*
         * MOVE_LERP controla a velocidade do movimento suave (lerp).
         * Com delta ≈ 0.016s (60fps): t = MOVE_LERP × delta
         * MOVE_LERP = 4 → 91% do caminho em ~620ms → movimento visível
         * MOVE_LERP = 8 → 91% em ~310ms → mais rápido
         * MOVE_LERP = 15 → 91% em ~165ms → quase teleporte (valor original)
         */
        const MOVE_LERP = 4;
        const ROT_LERP = 8;

        const moveSpeed = MOVE_LERP * delta;
        const { x, y, z } = groupRef.current.position;

        let hopOffset = 0;
        if (isHopping) {
            hopProgress.current += delta * 12;
            if (hopProgress.current >= Math.PI) {
                setIsHopping(false);
                hopProgress.current = 0;
            } else {
                hopOffset = Math.sin(hopProgress.current) * 0.1;
            }
        }

        let nx = MathUtils.lerp(x, targetX, moveSpeed);
        let nz = MathUtils.lerp(z, targetZ, moveSpeed);
        let ny = MathUtils.lerp(y, targetY, moveSpeed);

        const dY = targetY - y;
        const dXZ = Math.hypot(targetX - x, targetZ - z);

        if (dY > 0.08 && dXZ > 0.05) {
            nx = x;
            nz = z;
        } else if (dY < -0.08 && dXZ > 0.1) {
            ny = y;
        }

        groupRef.current.position.set(nx, ny + hopOffset, nz);

        let diff = targetRotY - groupRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        groupRef.current.rotation.y += Math.abs(diff) < 0.005 ? diff : diff * ROT_LERP * delta;
    });

    return (
        <group ref={groupRef} scale={scale}>
            <primitive object={scene} />
        </group>
    );
}
