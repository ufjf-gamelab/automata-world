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
        initialRotation: 4, // começa olhando para Norte
        initialGraph: {
            nodes: [
                { id: "0", label: "0", isInitial: true },
                { id: "1", label: "1" },
                { id: "2", label: "2", isFinal: true },
            ],
            edges: [
                { source: "0", target: "1", label: "f", action: "f" },
                { source: "1", target: "2", label: "b", action: "b" },
            ],
        },
    },
    {
        id: 0,
        name: "Fase 0",
        floor: `-1  
616
-6
`,
        playerPosition: [1, 0],
        initialGraph: {
            nodes: [
                { id: "0", label: "0", isInitial: true },
                { id: "1", label: "1", isFinal: true },
            ],
            edges: [{ source: "0", target: "1", label: "f", action: "f" }],
        },
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
        initialGraph: undefined,
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
        initialGraph: undefined,
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
        initialGraph: undefined,
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
        initialGraph: undefined,
    },
    {
        id: 6,
        name: "🔒 Só Frente",
        floor: `111116
`,
        playerPosition: [0, 0],
        initialRotation:1,
        permissions: {
            allowedCommands: ["f", "b"],
            allowedSymbols: ["f"],
            stateActionsAllowed: false,
            allowLoops: true,
            allowMultipleOutgoing: false,
        },
        initialGraph: {
            nodes: [
                { id: "0", label: "0", isInitial: true },
                { id: "1", label: "1", isFinal: true },
            ],
            edges: [
                { source: "0", target: "1", label: "f", action: "f" },
                { source: "1", target: "1", label: "f", action: "f" },
            ],
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
            fixedTape: "FNFB",
            maxNodes: 3,
            allowLoops: false,
            allowMultipleOutgoing: false,
        },
        initialGraph: undefined,
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
            stateActionsAllowed: false,
            edgeActionsAllowed: false,
            maxNodes: 4,
            allowLoops: false,
            allowMultipleOutgoing: true,
        },
        initialGraph: undefined,
    },
];
