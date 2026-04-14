/**
 * useNodeDrag.ts — Hook que conecta D3 e eventos touch ao elemento SVG de um nó
 *
 * Separar esta lógica do Node.tsx mantém o componente visual limpo.
 * São dois comportamentos bem distintos que precisam coexistir:
 *
 *   Mouse (D3): o D3 intercepta os eventos de drag do mouse diretamente no SVG,
 *               porque oferece coordenadas já transformadas pelo zoom/pan atual.
 *
 *   Touch (nativo): o D3 não lida bem com multi-touch em SVG. Por isso, os
 *               eventos de toque são tratados manualmente com addEventListener,
 *               convertendo as coordenadas da tela para o espaço do grafo
 *               através da função screenToWorld.
 *
 * O atributo data-drag no elemento é usado para diferenciar clique de arrasto:
 *   "maybe" → botão pressionado, ainda não se moveu
 *   "yes"   → movimento detectado, é um arrasto
 *   "no"    → botão solto após arrasto (evita disparar o onClick)
 */
import { useEffect } from "react";
import * as d3 from "d3";
import type { RefObject } from "react";
import type { Node } from "../AutomatonReducer";

/** Tempo em ms que o dedo precisa ficar parado para acionar o long press */
const LONG_PRESS_MS = 450;

/** Distância mínima em pixels para considerar um movimento como arrasto (e não toque) */
const DRAG_THRESHOLD = 8;

interface UseNodeDragParams {
    nodeRef: RefObject<SVGGElement | null>;
    nodeDataRef: RefObject<Node>; // ref ao nó atual (evita closure stale)
    onDragRef: RefObject<(id: string, x: number, y: number) => void>;
    onClickRef: RefObject<(event: React.MouseEvent | React.TouchEvent, node: Node) => void>;
    onLongPressRef: RefObject<((event: TouchEvent, node: Node) => void) | undefined>;
    screenToWorldRef: RefObject<(clientX: number, clientY: number) => { x: number; y: number }>;
    draggingClass: string; // classe CSS aplicada durante o arrasto
}

export function useNodeDrag({
    nodeRef,
    nodeDataRef,
    onDragRef,
    onClickRef,
    onLongPressRef,
    screenToWorldRef,
    draggingClass,
}: UseNodeDragParams) {
    // --- Drag com mouse via D3 ---
    useEffect(() => {
        if (!nodeRef.current) return;
        const sel = d3.select(nodeRef.current);

        const drag = d3
            .drag<SVGGElement, unknown>()
            .filter((e) => !("touches" in e)) // ignora eventos de toque (tratados abaixo)
            .on("start", function (e) {
                d3.select(this).raise().classed(draggingClass, true);
                nodeRef.current?.setAttribute("data-drag", "maybe");
                e.sourceEvent?.stopPropagation();
            })
            .on("drag", (e) => {
                nodeRef.current?.setAttribute("data-drag", "yes");
                onDragRef.current(nodeDataRef.current.id, e.x, e.y);
            })
            .on("end", function () {
                d3.select(this).classed(draggingClass, false);
                // Pequeno delay para que o onClick do React não seja disparado após o arrasto
                setTimeout(() => nodeRef.current?.setAttribute("data-drag", "no"), 0);
            });

        sel.call(drag as any);
    }, []);

    // --- Drag, toque simples e long press via eventos nativos ---
    useEffect(() => {
        const el = nodeRef.current;
        if (!el) return;

        let startX = 0,
            startY = 0;
        let dragging = false;
        let longFired = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const onTouchStart = (e: TouchEvent) => {
            e.stopPropagation();
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            dragging = false;
            longFired = false;

            // Traz o nó para frente na ordem Z do SVG durante o toque
            el.parentElement?.appendChild(el);

            // Inicia o timer de long press — cancelado se o dedo se mover
            timer = setTimeout(() => {
                if (!dragging) {
                    longFired = true;
                    onLongPressRef.current?.(e, nodeDataRef.current);
                }
            }, LONG_PRESS_MS);
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault(); // impede scroll da página durante o arrasto
            e.stopPropagation();
            const t = e.touches[0];

            // Classifica como arrasto apenas depois de ultrapassar o threshold
            if (!dragging && Math.hypot(t.clientX - startX, t.clientY - startY) > DRAG_THRESHOLD) {
                dragging = true;
                if (timer) clearTimeout(timer);
                el.classList.add(draggingClass);
            }

            if (dragging) {
                // Converte coordenadas da tela para o espaço do grafo (com zoom/pan)
                const { x, y } = screenToWorldRef.current(t.clientX, t.clientY);
                onDragRef.current(nodeDataRef.current.id, x, y);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            e.stopPropagation();
            if (timer) clearTimeout(timer);
            el.classList.remove(draggingClass);

            if (dragging) {
                dragging = false;
                return; // foi arrasto, não dispara clique
            }

            // Foi um toque simples (sem arrasto e sem long press) — dispara como clique
            if (!longFired) {
                onClickRef.current(e as unknown as React.TouchEvent, nodeDataRef.current);
            }
        };

        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: false }); // false para poder chamar preventDefault
        el.addEventListener("touchend", onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
            el.removeEventListener("touchend", onTouchEnd);
        };
    }, []);
}
