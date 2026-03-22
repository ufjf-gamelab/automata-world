import type { Stage } from "./Types";

export const stagesList: Stage[] = [
    {
        id: 1,
        name: "Fase 1",
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
        id: 2,
        name: "Fase 2",
        floor: `1111
1221
1282
1626
`,
        playerPosition: [1, 1],
    },
    {
        id: 3,
        name: "Fase 3",
        floor: `11111
17771
17371
17771
11111
`,
        playerPosition: [1, 1],
    },
    {
        id: 4,
        name: "Fase 4",
        floor: `1
2-716
8-2-2
4-3-1
0-4-7
448-8
`,
        playerPosition: [0, 0],
    },
];
