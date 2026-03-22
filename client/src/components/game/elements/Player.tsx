import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, MathUtils, Vector3, LoopOnce, LoopRepeat } from "three";
import type { PlayerProps } from "./playerTypes";
import { PLAYER_CONFIG } from "./playerConfig";

export default function Player({
    gridPosition,
    rotationIndex,
    blockHeight = 0,
    stepIndex = 0,
    command = "",
}: PlayerProps) {
    const groupRef = useRef<Group>(null);
    const { scene, animations } = useGLTF(PLAYER_CONFIG.modelPath);
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

    // Troca de animação com crossfade ──────────────────────────────────────
    const playAnim = (name: string | null, once = false) => {
        if (!name) return;
        const next = actions[name];
        if (!next) {
            console.warn("Clip não encontrado:", name, "| Disponíveis:", Object.keys(actions));
            return;
        }
        if (!once && currentAnimRef.current === name) return;
        const prev = actions[currentAnimRef.current];
        next.reset();
        next.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
        next.clampWhenFinished = false;
        if (prev && prev !== next) next.crossFadeFrom(prev, 0.15, true);
        next.play();
        currentAnimRef.current = name;
    };

    // Inicia idle ao carregar ───────────────────────────────────────────────
    useEffect(() => {
        console.log("Clips disponíveis:", Object.keys(actions));
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

        if (["f", "e", "d", "t"].includes(cmd)) {
            playAnim(ANIMS.walk);
            setTimeout(() => {
                if (!isLockedRef.current) playAnim(ANIMS.idle);
            }, 350);
        } else if (cmd === "p") {
            isLockedRef.current = true;
            if (ANIMS.jump) {
                const jumpAction = actions[ANIMS.jump];
                if (jumpAction) {
                    jumpAction.reset();
                    jumpAction.setLoop(LoopOnce, 1);
                    jumpAction.clampWhenFinished = true;
                    jumpAction.timeScale = 1;
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
        } else if (cmd === "b") {
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

    // Teleporte ao resetar fase ────────────────────────────────────────────
    useEffect(() => {
        if (!groupRef.current) return;
        const dist = new Vector3(targetX, targetY, targetZ).distanceTo(groupRef.current.position);
        if (dist > 2) {
            groupRef.current.position.set(targetX, targetY, targetZ);
            groupRef.current.rotation.y = targetRotY;
        }
    }, [targetX, targetY, targetZ]);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const speed = 15 * delta;
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

        // Interpolação — lógica original preservada
        let nx = MathUtils.lerp(x, targetX, speed);
        let nz = MathUtils.lerp(z, targetZ, speed);
        let ny = MathUtils.lerp(y, targetY, speed);

        const dY = targetY - y;
        const dXZ = Math.hypot(targetX - x, targetZ - z);

        if (dY > 0.1 && Math.abs(dY) > 0.05) {
            nx = x; // sobe primeiro
            nz = z;
        } else if (dY < -0.1 && dXZ > 0.05) {
            ny = y; // desce depois de chegar no XZ
        }

        groupRef.current.position.set(nx, ny + hopOffset, nz);

        // Rotação suave
        let diff = targetRotY - groupRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        groupRef.current.rotation.y += Math.abs(diff) < 0.01 ? diff : diff * speed;
    });

    return (
        <group ref={groupRef} scale={scale}>
            <primitive object={scene} />
        </group>
    );
}

useGLTF.preload(PLAYER_CONFIG.modelPath);
