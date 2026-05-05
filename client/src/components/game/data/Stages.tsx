import type { Stage } from "./types";

export const stagesList: Stage[] = [
    {
        id: -1777947115042,
        name: "1",
        floor: "1\n1\n6",
        playerPosition: [0, 0],
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 4,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "b"],
        },
        initialGraph: {
            nodes: [
                {
                    id: "1",
                    label: "1",
                    isInitial: true,
                    isFinal: false,
                },
                {
                    id: "2",
                    label: "2",
                    isInitial: false,
                    isFinal: false,
                },
                {
                    id: "3",
                    label: "3",
                    isInitial: false,
                    isFinal: false,
                },
                {
                    id: "4",
                    label: "4",
                    isInitial: false,
                    isFinal: true,
                },
            ],
            edges: [
                {
                    source: "1",
                    target: "2",
                    label: "a",
                },
                {
                    source: "2",
                    target: "3",
                    label: "a",
                },
                {
                    source: "3",
                    target: "4",
                    label: "a",
                },
            ],
        },
    },
//     {
//         id: 1,
//         name: "Fase Meia Volta",
//         floor: `-6-1  
// -6-1
// -1-1
// -1-6
// -616
// `,
//         playerPosition: [3, 0],
//         initialRotation: 2,
//         // tutorial: [
//         //     {
//         //         // Substitua pela URL ou caminho real da imagem (ex: "/tutorial/automato.png")
//         //         image: undefined,
//         //         text: "Bem-vindo ao Automata World! 🤖\n\nAqui você controla um personagem usando um autômato finito. Cada símbolo da fita dispara uma transição que executa um comando no jogo.",
//         //     },
//         //     {
//         //         image: undefined,
//         //         text: "✏️ Como funciona\n\nNo editor à esquerda, construa um autômato. Cada estado pode ter uma ação (ex: Frente, Girar). A fita de entrada define a sequência de símbolos lida.",
//         //     },
//         //     {
//         //         image: undefined,
//         //         text: "🎯 Objetivo desta fase\n\nChegue ao botão azul e pressione-o. Use os comandos Forward (f) e Button (b) para montar seu autômato e completar o percurso!",
//         //     },
//         // ],
//         initialGraph: {
//             nodes: [
//                 { id: "0", label: "0", isInitial: true },
//                 { id: "1", label: "1" },
//                 { id: "2", label: "2", isFinal: true },
//             ],
//             edges: [
//                 { source: "0", target: "1", label: "f", action: "f" },
//                 { source: "1", target: "2", label: "b", action: "b" },
//             ],
//         },
//     },
//     {
//         id: 0,
//         name: "Fase 0",
//         floor: `-1  
// 616
// -6
// `,
//         playerPosition: [1, 0],
//         tutorial: [
//             {
//                 image: undefined,
//                 text: "🔵 Fase simples!\n\nO botão está logo à frente. Construa um autômato com dois estados e uma transição 'f' para avançar e pressionar o botão.",
//             },
//         ],
//         initialGraph: {
//             nodes: [
//                 { id: "0", label: "0", isInitial: true },
//                 { id: "1", label: "1", isFinal: true },
//             ],
//             edges: [{ source: "0", target: "1", label: "f", action: "f" }],
//         },
//     },
//     {
//         id: 2,
//         name: "Fase 2",
//         floor: `--6  
// --1
// --162
// ----3
// --172
// --1
// --6
// `,
//         playerPosition: [2, 0],
//         initialGraph: undefined,
//     },
//     {
//         id: 3,
//         name: "Fase 3",
//         floor: `1111
// 1221
// 1282
// 1626
// `,
//         playerPosition: [1, 1],
//         initialGraph: undefined,
//     },
//     {
//         id: 4,
//         name: "Fase 4",
//         floor: `11111
// 17771
// 17371
// 17771
// 11111
// `,
//         playerPosition: [1, 1],
//         initialGraph: undefined,
//     },
//     {
//         id: 5,
//         name: "Fase 5",
//         floor: `1
// 2-716
// 8-2-2
// 4-3-1
// 0-4-7
// 448-8
// `,
//         playerPosition: [0, 0],
//         initialGraph: undefined,
//     },
//     {
//         id: 6,
//         name: "Só Frente",
//         floor: `111116
// `,
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         // tutorial: [
//         //     {
//         //         image: undefined,
//         //         text: "🔒 Fase com restrições!\n\nNesta fase você só pode usar o comando Forward (f). Gire a câmera e veja que o boneco já está apontado na direção certa. Monte um autômato que avance até o botão.",
//         //     },
//         // ],
//         permissions: {
//             allowedCommands: ["f", "b"],
//             allowedSymbols: ["f"],
//             stateActionsAllowed: false,
//             allowLoops: true,
//             allowMultipleOutgoing: false,
//         },
//         initialGraph: {
//             nodes: [
//                 { id: "0", label: "0", isInitial: true },
//                 { id: "1", label: "1", isFinal: true },
//             ],
//             edges: [
//                 { source: "0", target: "1", label: "f", action: "f" },
//                 { source: "1", target: "1", label: "f", action: "f" },
//             ],
//         },
//     },
//     {
//         id: 7,
//         name: "Fita Fixada",
//         floor: `-1  
// 616
// -6
// `,
//         playerPosition: [1, 0],
//         permissions: {
//             fixedTape: "FNFB",
//             maxNodes: 3,
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//         },
//         initialGraph: undefined,
//     },
//     {
//         id: 8,
//         name: "Sem Ações",
//         floor: `1111
// 1221
// 1282
// 1626
// `,
//         playerPosition: [1, 1],
//         permissions: {
//             stateActionsAllowed: false,
//             edgeActionsAllowed: false,
//             maxNodes: 4,
//             allowLoops: false,
//             allowMultipleOutgoing: true,
//         },
//         initialGraph: undefined,
//     },
];
