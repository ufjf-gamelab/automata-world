import type { Stage } from "./types";

export const stagesList: Stage[] = [
    {
        id: 1,
        name: "Fase Meia Volta",
        floor: `-6-1  
-6-1
-1-1
-1-6
-616
`,
        playerPosition: [3, 0],
    },
    {
        id: 0,
        name: "Fase 0",
        floor: `-1  
616
-6
`,
        playerPosition: [1, 0],
    },
    {
        id: 2,
        name: "Fase 2",
        floor: `--6  
--1
--162
----3
--172
--1
--6
`,
        playerPosition: [2, 0],
    },
    {
        id: 3,
        name: "Fase 3",
        floor: `1111
1221
1282
1626
`,
        playerPosition: [1, 1],
    },
    {
        id: 4,
        name: "Fase 4",
        floor: `11111
17771
17371
17771
11111
`,
        playerPosition: [1, 1],
    },
    {
        id: 5,
        name: "Fase 5",
        floor: `1
2-716
8-2-2
4-3-1
0-4-7
448-8
`,
        playerPosition: [0, 0],
    },
    {
        id: 6,
        name: "🔒 Só Frente",
        floor: `111116
`,
        playerPosition: [0, 0],
        permissions: {
            // Apenas o comando "frente" e "botão" são permitidos
            allowedCommands: ["f", "b"],
            // Apenas o símbolo "f" pode ser usado nas transições
            allowedSymbols: ["f"],
            // Sem ações em estados
            stateActionsAllowed: false,
        },
    },
    {
        id: 7,
        name: "🔒 Fita Fixada",
        floor: `-1  
616
-6
`,
        playerPosition: [1, 0],
        permissions: {
            // A fita já vem preenchida e não pode ser editada
            fixedTape: "FNFB",
            // Máximo 3 estados no autômato
            maxNodes: 3,
        },
    },
    {
        id: 8,
        name: "🔒 Sem Ações",
        floor: `1111
1221
1282
1626
`,
        playerPosition: [1, 1],
        permissions: {
            // Não é permitido definir ações em estados nem em transições
            stateActionsAllowed: false,
            edgeActionsAllowed: false,
            maxNodes: 4,
        },
    },
];
