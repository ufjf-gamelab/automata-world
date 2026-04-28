import { useState, useCallback } from "react";
import type { Stage } from "../data/types";

const STORAGE_KEY = "automata_world_custom_stages";

/** Gera um ID negativo único para não colidir com IDs das fases oficiais (0-8) */
const generateId = (): number => -(Date.now() % 1_000_000);

function loadFromStorage(): Stage[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Stage[];
    } catch {
        return [];
    }
}

function saveToStorage(stages: Stage[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stages));
}

export function useCustomStages() {
    const [customStages, setCustomStages] = useState<Stage[]>(loadFromStorage);

    const saveStage = useCallback((stage: Stage) => {
        setCustomStages((prev) => {
            const exists = prev.findIndex((s) => s.id === stage.id);
            const next =
                exists >= 0
                    ? prev.map((s) => (s.id === stage.id ? stage : s))
                    : [...prev, { ...stage, id: stage.id < 0 ? stage.id : generateId() }];
            saveToStorage(next);
            return next;
        });
    }, []);

    const deleteStage = useCallback((id: number) => {
        setCustomStages((prev) => {
            const next = prev.filter((s) => s.id !== id);
            saveToStorage(next);
            return next;
        });
    }, []);

    const createBlank = useCallback(
        (): Stage => ({
            id: generateId(),
            name: "Novo Mapa",
            floor: "111\n111\n111",
            playerPosition: [0, 0],
        }),
        [],
    );

    return { customStages, saveStage, deleteStage, createBlank };
}
