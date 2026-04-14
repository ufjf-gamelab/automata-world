/**
 * Player.tsx — Personagem 3D animado do jogo
 *
 * Carrega o modelo GLTF do personagem, aplica a textura corretamente
 * (contornando o problema de caminho relativo no build do GitHub Pages),
 * e gerencia as animações e o movimento suave no espaço 3D.
 *
 * Funcionamento das animações:
 *   - stepIndex incrementa a cada comando executado (via gameReducer.stepCounter)
 *   - Quando stepIndex muda, o useEffect lê `command` para saber qual animação tocar
 *   - isLockedRef impede que uma nova animação interrompa outra ainda em andamento (ex: jump)
 *
 * Funcionamento do movimento:
 *   - As posições targetX/Y/Z são derivadas do estado lógico do jogo
 *   - useFrame interpola a posição atual até o alvo a cada frame (lerp)
 *   - A lógica de "sobe primeiro, desce depois" evita que o personagem atravesse tiles
 */
import { useRef, useEffect, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useAnimations } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, MathUtils, Vector3, LoopOnce, LoopRepeat, LoadingManager } from "three";
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

    // Carrega o GLTF usando um LoadingManager customizado que intercepta a URL
    // da textura antes da requisição HTTP, redirecionando para o path com hash
    // gerado pelo Vite — resolve o erro 404 no deploy do GitHub Pages.
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

    const currentAnimRef = useRef<string>(""); // nome da animação em execução
    const isLockedRef = useRef(false); // true durante animações que não podem ser interrompidas
    const hopProgress = useRef(0); // progresso do efeito de "pulo" ao pressionar botão
    const [isHopping, setIsHopping] = useState(false);

    const { animations: ANIMS, scale, yOffset } = PLAYER_CONFIG;

    // Posição e rotação alvo derivadas do estado lógico do jogo
    const targetX = gridPosition[0];
    const targetZ = gridPosition[1];
    const targetY = blockHeight * 0.5 + yOffset;
    const targetRotY = rotationIndex * (Math.PI / 2);

    /**
     * Troca a animação atual com crossfade suave de 150ms.
     * Se `once` for true, a animação toca uma vez e para (ex: pulo, interação).
     */
    const playAnim = (name: string | null, once = false) => {
        if (!name) return;
        const next = actions[name];
        if (!next) {
            console.warn("Clip não encontrado:", name, "| Disponíveis:", Object.keys(actions));
            return;
        }
        if (!once && currentAnimRef.current === name) return; // já tocando
        const prev = actions[currentAnimRef.current];
        next.reset();
        next.setLoop(once ? LoopOnce : LoopRepeat, once ? 1 : Infinity);
        next.clampWhenFinished = false;
        if (prev && prev !== next) next.crossFadeFrom(prev, 0.15, true);
        next.play();
        currentAnimRef.current = name;
    };

    // Inicia a animação idle após o modelo carregar (pequeno delay para garantir que
    // os clips já estão disponíveis no objeto `actions`)
    useEffect(() => {
        const t = setTimeout(() => playAnim(ANIMS.idle), 80);
        return () => clearTimeout(t);
    }, [actions]);

    // Reage a cada mudança de stepIndex (= novo comando executado no jogo)
    useEffect(() => {
        if (stepIndex === 0) {
            // Reinício: reseta todas as flags e volta ao idle
            currentAnimRef.current = "";
            isLockedRef.current = false;
            setIsHopping(false);
            hopProgress.current = 0;
            setTimeout(() => playAnim(ANIMS.idle), 80);
            return;
        }

        if (isLockedRef.current) return; // animação anterior ainda em andamento

        const cmd = command.toLowerCase();

        if (["f", "e", "d", "t"].includes(cmd)) {
            // Movimento: toca walk e volta ao idle após ~1s
            playAnim(ANIMS.walk);
            setTimeout(() => {
                if (!isLockedRef.current) playAnim(ANIMS.idle);
            }, 1000);
        } else if (cmd === "p") {
            // Pulo: bloqueia outras animações até terminar
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
            // Pressionar botão: animação de interação + efeito de "hop" no eixo Y
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

    // Teleporte instantâneo quando o personagem muda de posição abruptamente
    // (ex: troca de fase ou reset). Evita animação de movimento desnecessária.
    useEffect(() => {
        if (!groupRef.current) return;
        const dist = new Vector3(targetX, targetY, targetZ).distanceTo(groupRef.current.position);
        if (dist > 2) {
            groupRef.current.position.set(targetX, targetY, targetZ);
            groupRef.current.rotation.y = targetRotY;
        }
    }, [targetX, targetY, targetZ]);

    // Interpolação suave da posição e rotação a cada frame
    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const speed = 15 * delta;
        const { x, y, z } = groupRef.current.position;

        // Efeito de "hop" ao pressionar botão: sobe e desce suavemente
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

        let nx = MathUtils.lerp(x, targetX, speed);
        let nz = MathUtils.lerp(z, targetZ, speed);
        let ny = MathUtils.lerp(y, targetY, speed);

        const dY = targetY - y;
        const dXZ = Math.hypot(targetX - x, targetZ - z);

        // Sobe antes de se mover horizontalmente (evita atravessar bordas de tiles)
        if (dY > 0.1 && Math.abs(dY) > 0.05) {
            nx = x;
            nz = z;
        }
        // Desce só depois de chegar na posição horizontal correta
        else if (dY < -0.1 && dXZ > 0.05) {
            ny = y;
        }

        groupRef.current.position.set(nx, ny + hopOffset, nz);

        // Rotação suave pelo caminho mais curto (evita giro de 270° quando -90° seria suficiente)
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
