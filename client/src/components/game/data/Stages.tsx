import type { Stage } from "./types";

// const oldStages: Stage[] = [
//     {
//         id: 1,
//         name: "Reta simples",
//         floor: "116",
//         initialRotation: 1,
//         playerPosition: [0, 0],
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 4,
//             allowedSymbols: ["a"],
//             allowedCommands: ["f", "b"],
//             fixedTape: "aaa",
//         },
//         initialGraph: {
//             nodes: [
//                 { id: "1", label: "1", isInitial: true, isFinal: false },
//                 { id: "2", label: "2", isInitial: false, isFinal: false },
//                 { id: "3", label: "3", isInitial: false, isFinal: false },
//                 { id: "4", label: "4", isInitial: false, isFinal: true },
//             ],
//             edges: [
//                 { source: "1", target: "2", label: "a", action: "f" },
//                 { source: "2", target: "3", label: "a", action: "f" },
//                 { source: "3", target: "4", label: "a", action: "b" },
//             ],
//         },
//         tutorial: [
//             {
//                 image: "tutorial/reta/passo1.png",
//                 text: "Bem-vindo ao **Automa World**! Seu objetivo é levar o personagem até o **botão azul** no final do caminho.",
//             },
//             {
//                 image: "tutorial/reta/passo2.png",
//                 text: "O **autômato** já está pronto! Cada transição com **A** avança o personagem, e a última aciona o botão.",
//             },
//             {
//                 image: "tutorial/reta/passo3.png",
//                 text: "Escreva a fita **AAA** para executar.",
//             },
//         ],
//     },
//     {
//         id: 2,
//         name: "Virando à direita",
//         floor: `111
// --1
// --6`,
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 6,
//             allowedSymbols: ["f", "d", "b"],
//             allowedCommands: ["f", "d", "b"],
//             fixedTape: "FFDFFB",
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//         tutorial: [
//             {
//                 image: "tutorial/virada_direita/passo1.png",
//                 text: "Agora você aprende a **virar à direita** (↻). O caminho vai para o lado e depois para baixo — você precisa girar no momento certo!",
//             },
//             {
//                 image: "tutorial/virada_direita/passo2.png",
//                 text: "O símbolo **D** gira o personagem 90° no sentido horário ↻. Leia a fita **FFDFFB**: avança, avança, vira, avança, avança, botão!",
//             },
//         ],
//     },
//     {
//         id: 3,
//         name: "Meia volta",
//         floor: `1-6
// 1-1
// 111`,
//         playerPosition: [0, 0],
//         initialRotation: 0,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 9,
//             allowedSymbols: ["f", "e", "b"],
//             allowedCommands: ["f", "b", "e", "d"],
//             fixedTape: "FFEFFEFFB",
//         },
//         initialGraph: {
//             nodes: [
//                 { id: "1", label: "1", isInitial: true, isFinal: false },
//                 { id: "2", label: "2", isInitial: false, isFinal: false },
//                 { id: "3", label: "3", isInitial: false, isFinal: false },
//                 { id: "4", label: "4", isInitial: false, isFinal: false },
//             ],
//             edges: [{ source: "1", target: "2", label: "f", action: "f" }],
//         },
//         tutorial: [
//             {
//                 image: "tutorial/meia_volta/passo1.png",
//                 text: "O caminho agora tem **curvas**! Você precisa virar o personagem na hora certa para chegar ao botão.",
//             },
//             {
//                 image: "tutorial/meia_volta/passo2.png",
//                 text: "Você tem 3 símbolos: **F** (frente), **E** (girar à esquerda ↺) e **B** (botão). A fita **FFEFFEFFB** já diz o caminho exato!",
//             },
//             {
//                 image: "tutorial/meia_volta/passo3.png",
//                 text: "Complete o autômato: você precisará de **9 estados** — um para cada símbolo da fita. O último deve ser o **estado final**.",
//             },
//         ],
//     },
//     {
//         id: 4,
//         name: "Zigue-Zague",
//         floor: `1116--
// ---1--
// ---1--
// ---116`,
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 11,
//             allowedSymbols: ["f", "e", "d", "b"],
//             allowedCommands: ["f", "e", "d", "b"],
//             fixedTape: "FFFEFFFDFFB",
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//         tutorial: [
//             {
//                 image: "tutorial/ziguezague/passo1.png",
//                 text: "O percurso forma um **Z**! Você vai para a direita, desce e vai para a esquerda. São **duas viradas** — uma com **D** e outra com **E**.",
//             },
//             {
//                 image: "tutorial/ziguezague/passo2.png",
//                 text: "**E** e **D** giram em sentidos opostos. Observe a fita **FFFEFFFDFFB** — o E vira na descida e o D vira na segunda reta horizontal.",
//             },
//             {
//                 image: "tutorial/ziguezague/passo3.png",
//                 text: "Monte **11 estados** — um para cada símbolo. Use **F** para andar, **E** e **D** para virar e **B** para o botão. Você consegue!",
//             },
//         ],
//     },
//     {
//         id: 5,
//         name: "Pequena escada",
//         floor: "128",
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 4,
//             allowedSymbols: ["p", "b"],
//             allowedCommands: ["p", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 6,
//         name: "Subida espiral",
//         floor: `93
// 12`,
//         playerPosition: [0, 1],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 6,
//             allowedSymbols: ["p", "e", "b"],
//             allowedCommands: ["p", "b", "e", "d"],
//             fixedTape: "PEPEPB",
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 7,
//         name: "Corredor infinito",
//         floor: "11111116",
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: true,
//             allowMultipleOutgoing: true,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 2,
//             allowedSymbols: ["a", "b"],
//             allowedCommands: ["f", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 8,
//         name: "Escada sem fim",
//         floor: "12340",
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: true,
//             allowMultipleOutgoing: true,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 2,
//             allowedSymbols: ["p", "b"],
//             allowedCommands: ["p", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 9,
//         name: "Degraus alternados",
//         floor: "1212127",
//         playerPosition: [0, 0],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: true,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 3,
//             allowedSymbols: ["p", "f", "b"],
//             allowedCommands: ["p", "f", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 10,
//         name: "Labirinto em U",
//         floor: `1-6
// 1-1
// 111`,
//         playerPosition: [0, 0],
//         initialRotation: 0,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 9,
//             allowedSymbols: ["f", "d", "b"],
//             allowedCommands: ["f", "d", "b"],
//             fixedTape: "FFDFFDFFB",
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 11,
//         name: "Espiral 3x3",
//         floor: `948
// 503
// 127`,
//         playerPosition: [0, 2],
//         initialRotation: 1,
//         permissions: {
//             allowLoops: false,
//             allowMultipleOutgoing: false,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 8,
//             allowedSymbols: ["f", "d", "b"],
//             allowedCommands: ["f", "d", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
//     {
//         id: 12,
//         name: "Desafio livre",
//         floor: `1111
// 1--1
// 1--1
// 1116`,
//         playerPosition: [0, 0],
//         initialRotation: 0,
//         permissions: {
//             allowLoops: true,
//             allowMultipleOutgoing: true,
//             stateActionsAllowed: false,
//             edgeActionsAllowed: true,
//             maxNodes: 12,
//             allowedSymbols: ["f", "d", "e", "b"],
//             allowedCommands: ["f", "d", "e", "b"],
//         },
//         initialGraph: {
//             nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
//             edges: [],
//         },
//     },
// ];

// ═══════════════════════════════════════════════════════════════
//  FASES LFA — PROGRESSÃO PEDAGÓGICA
//
//  Fase 101 — Observação         : autômato pré-montado, só executa
//  Fase 102 — Primeira interação : marca o estado inicial
//  Fase 103 — Transições         : cria as arestas entre estados dados
//  Fase 104 — Aceitação          : define os estados finais
//  Fase 105 — Autômato completo  : constrói o AFD inteiro do zero
//  Fase 106 — Sandbox            : modo livre, sem restrições
//
//  CODIFICAÇÃO DO MAPA (floor):
//   1-5 → tile de altura 1–5
//   6-9 → botão de altura 1–4  (6=btn h1, 7=btn h2, 8=btn h3, 9=btn h4)
//   0   → botão de altura 5
//   -   → vazio (sem bloco)
//
//  REGRA DO BOTÃO: o comando "b" pressiona o botão na posição ATUAL
//  do jogador. O jogador precisa ESTAR em cima do tile de botão para
//  pressionar. Portanto, a última ação antes de "b" deve ser "f" ou "p"
//  movendo o jogador até o tile do botão.
// ═══════════════════════════════════════════════════════════════
const newStages: Stage[] = [
    // ─────────────────────────────────────────────────────────
    //  FASE 101 — OBSERVAÇÃO
    //  Mapa: reta 3 blocos  [P→1→1→B]
    //  Caminho: f,f,b  (3 transições, fita "aaa")
    //  [0,0]=tile, [1,0]=tile, [2,0]=button
    //  Jogador em [0,0] East: f→[1,0], f→[2,0](btn), b→pressiona
    // ─────────────────────────────────────────────────────────
    {
        id: 101,
        name: "LFA 1 — Observação",
        floor: "116",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: false,
            maxNodes: 4,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "b"],
            fixedTape: "aaa",
        },
        initialGraph: {
            nodes: [
                { id: "1", label: "1", isInitial: true, isFinal: false },
                { id: "2", label: "2", isInitial: false, isFinal: false },
                { id: "3", label: "3", isInitial: false, isFinal: false },
                { id: "4", label: "4", isInitial: false, isFinal: true },
            ],
            edges: [
                { source: "1", target: "2", label: "a", action: "f" },
                { source: "2", target: "3", label: "a", action: "f" },
                { source: "3", target: "4", label: "a", action: "b" },
            ],
        },
        tutorial: [
            {
                image: "lfa/01observacao/passo1.png",
                text:
                    "Bem-vindo às aulas de **Linguagens Formais e Autômatos**! " +
                    "O autômato já está montado. Observe o grafo ao lado: " +
                    "cada **círculo** é um estado e cada **seta** é uma transição.",
            },
            {
                image: "lfa/01observacao/passo2.png",
                text:
                    "O **estado inicial** (seta de entrada) é de onde o autômato parte. " +
                    "O **estado final** (borda dupla) é onde ele precisa chegar para aceitar a entrada. " +
                    "Cada aresta carrega o símbolo que a dispara e a ação do personagem.",
            },
            {
                image: "lfa/01observacao/passo3.png",
                text:
                    "A fita já está preenchida com 'aaa'. " +
                    "Clique em **Executar** e observe: a cada símbolo lido, " +
                    "o autômato avança um estado e o personagem executa a ação correspondente.",
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    //  FASE 102 — PRIMEIRA INTERAÇÃO
    //  Mapa: reta 4 blocos  [P→1→1→1→B]  (floor "1116")
    //  Caminho: f,f,f,b  (4 transições, fita "aaaa")
    //  [0,0]=tile, [1,0]=tile, [2,0]=tile, [3,0]=button
    //  Jogador em [0,0] East: f→[1], f→[2], f→[3](btn), b→pressiona
    //  BUG ANTERIOR: floor "11116" tinha button em [4,0] mas ações só
    //  chegavam em [3,0]. Corrigido para "1116".
    // ─────────────────────────────────────────────────────────
    {
        id: 102,
        name: "LFA 2 — Estado inicial",
        floor: "1116",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: false,
            maxNodes: 5,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "b"],
            fixedTape: "aaaa",
        },
        initialGraph: {
            nodes: [
                { id: "1", label: "1", isInitial: false, isFinal: false },
                { id: "2", label: "2", isInitial: false, isFinal: false },
                { id: "3", label: "3", isInitial: false, isFinal: false },
                { id: "4", label: "4", isInitial: false, isFinal: false },
                { id: "5", label: "5", isInitial: false, isFinal: true },
            ],
            edges: [
                { source: "1", target: "2", label: "a", action: "f" },
                { source: "2", target: "3", label: "a", action: "f" },
                { source: "3", target: "4", label: "a", action: "f" },
                { source: "4", target: "5", label: "a", action: "b" },
            ],
        },
        tutorial: [
            {
                image: "lfa/02-estado-inicial/passo1.png",
                text:
                    "O autômato está quase pronto — os estados e as transições já existem. " +
                    "Mas falta algo essencial: o **estado inicial**! " +
                    "Sem ele, o autômato não sabe de onde partir.",
            },
            {
                image: "lfa/02-estado-inicial/passo2.png",
                text:
                    "O personagem começa no **primeiro bloco** — então o autômato também " +
                    "deve partir do estado que representa essa posição inicial. " +
                    "Clique com o botão direito no estado **1** e marque-o como inicial.",
            },
            {
                image: "lfa/02-estado-inicial/passo3.png",
                text:
                    "Agora o autômato tem um ponto de partida! " +
                    "Execute a fita 'aaaa' e veja o personagem percorrer os 3 blocos " +
                    "e apertar o botão ao chegar no estado final.",
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    //  FASE 103 — CONSTRUINDO TRANSIÇÕES
    //  Mapa: L  [P→1]
    //            [  ↑]
    //            [  B]
    //  Caminho: f,e,f,b  (4 transições, fita "aaaa")
    //  floor "-6\n11": [0,0]=vazio, [1,0]=button, [0,1]=tile, [1,1]=tile
    //  Jogador em [0,1] East: f→[1,1], e→vira Norte, f→[1,0](btn), b→pressiona
    //  BUG ANTERIOR: fixedTape "aaa" tinha 3 símbolos mas caminho precisa de 4
    //  e maxNodes 4 só permite 3 transições. Corrigido para "aaaa" e maxNodes 5.
    // ─────────────────────────────────────────────────────────
    {
        id: 103,
        name: "LFA 3 — Transições",
        floor: `-6
11`,
        playerPosition: [0, 1],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 5,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "e", "b"],
            fixedTape: "aaaa",
        },
        initialGraph: {
            nodes: [
                { id: "1", label: "1", isInitial: true, isFinal: false },
                { id: "2", label: "2", isInitial: false, isFinal: false },
                { id: "3", label: "3", isInitial: false, isFinal: false },
                { id: "4", label: "4", isInitial: false, isFinal: false },
                { id: "5", label: "5", isInitial: false, isFinal: true },
            ],
            edges: [],
        },
        tutorial: [
            {
                image: "lfa/03-transicoes/passo1.png",
                text:
                    "Os **estados** já estão criados, mas o autômato não sabe como se mover entre eles. " +
                    "Você precisa criar as **transições** — as arestas que conectam os estados. " +
                    "A função δ define: dado um estado e um símbolo, qual é o próximo estado?",
            },
            {
                image: "lfa/03-transicoes/passo2.png",
                text:
                    "Para criar uma transição: clique com o **botão direito** no estado de origem " +
                    "e escolha **'Ligar a Estado Existente'**. Selecione o destino, escolha o símbolo " +
                    "e a ação que o personagem deve executar ao percorrer aquela aresta.",
            },
            {
                image: "lfa/03-transicoes/passo3.png",
                text:
                    "Monte as **4 transições** conectando os estados em sequência. " +
                    "Analise o mapa: observe o caminho que o personagem precisa percorrer e defina " +
                    "a ação correta em cada aresta — avançar, virar ou pressionar o botão. " +
                    "Execute a fita 'aaaa' para verificar se o autômato está correto!",
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    //  FASE 104 — ACEITAÇÃO E REJEIÇÃO
    //  Mapa: reta 3 blocos  [P→1→1→B]  (floor "116")
    //  Caminho: f,f,b  (3 transições pré-dadas)
    //  [0,0]=tile, [1,0]=tile, [2,0]=button
    //  Jogador em [0,0] East: f→[1,0], f→[2,0](btn), b→pressiona
    //  BUG ANTERIOR: floor "1116" tinha button em [3,0] mas ação "b"
    //  era executada em [2,0] (tile comum). Corrigido para "116".
    // ─────────────────────────────────────────────────────────
    {
        id: 104,
        name: "LFA 4 — Estado final",
        floor: "116",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: false,
            maxNodes: 4,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "b"],
        },
        initialGraph: {
            nodes: [
                { id: "1", label: "1", isInitial: true, isFinal: false },
                { id: "2", label: "2", isInitial: false, isFinal: false },
                { id: "3", label: "3", isInitial: false, isFinal: false },
                { id: "4", label: "4", isInitial: false, isFinal: false },
            ],
            edges: [
                { source: "1", target: "2", label: "a", action: "f" },
                { source: "2", target: "3", label: "a", action: "f" },
                { source: "3", target: "4", label: "a", action: "b" },
            ],
        },
        tutorial: [
            {
                image: "lfa/04-aceitacao/passo1.png",
                text:
                    "O autômato tem estados e transições, mas ainda não sabe quando **aceitar** a entrada. " +
                    "Um AFD aceita uma cadeia somente se, após ler todos os símbolos, " +
                    "o estado atual for um **estado final** (borda dupla).",
            },
            {
                image: "lfa/04-aceitacao/passo2.png",
                text:
                    "Sem um estado final definido, qualquer cadeia é **rejeitada** — " +
                    "independentemente de onde o autômato pare. " +
                    "Pense: após ler 'aaa', o personagem aperta o botão no estado 4. " +
                    "Esse é o estado que deve ser o final!",
            },
            {
                image: "lfa/04-aceitacao/passo3.png",
                text:
                    "Clique com botão direito no estado **4** e marque-o como **estado final**. " +
                    "Agora execute a fita 'aaa': o personagem chega ao botão, " +
                    "o autômato para no estado final — e a cadeia é **aceita**!",
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    //  FASE 105 — AUTÔMATO COMPLETO
    //  Mapa: Γ  [P→1→B]  (row 0)
    //            [↑    ]  (row 1)
    //  Caminho: f,d,f,f,b  (5 transições, fita "aaaaa")
    //  floor "116\n1--": [0,0]=tile, [1,0]=tile, [2,0]=button, [0,1]=tile
    //  Jogador em [0,1] North: f→[0,0], d→vira East, f→[1,0], f→[2,0](btn), b→pressiona
    //  BUG ANTERIOR: maxNodes 5 permitia apenas 4 transições. O caminho precisa de 5.
    //  Corrigido para maxNodes 6 (6 estados = 5 transições em cadeia linear).
    // ─────────────────────────────────────────────────────────
    {
        id: 105,
        name: "LFA 5 — AFD completo",
        floor: `116
1--`,
        playerPosition: [0, 1],
        initialRotation: 2,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 6,
            allowedSymbols: ["a"],
            allowedCommands: ["f", "d", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                image: "lfa/05-afd-completo/passo1.png",
                text:
                    "Agora você monta o autômato **do zero**! " +
                    "Analise o mapa: o personagem precisa subir, virar à direita e avançar até o botão. " +
                    "Quantos estados e transições são necessários? Trace o caminho antes de começar.",
            },
            {
                image: "lfa/05-afd-completo/passo2.png",
                text:
                    "Lembre da **5-tupla M = (Q, Σ, δ, q₀, F)**: " +
                    "você precisa definir todos os 5 componentes. " +
                    "Crie estados, conecte-os com transições e marque " +
                    "o estado inicial (q₀) e o estado final (F).",
            },
            {
                image: "lfa/05-afd-completo/passo3.png",
                text:
                    "Dica: cada símbolo lido corresponde a um passo do personagem no mapa. " +
                    "Observe o caminho e defina a ação certa em cada transição. " +
                    "Não esqueça de marcar o **último estado** como final — " +
                    "execute a fita e veja o personagem chegar ao botão!",
            },
        ],
    },

    // ─────────────────────────────────────────────────────────
    //  FASE 106 — SANDBOX
    //  Sem restrições — modo livre
    // ─────────────────────────────────────────────────────────
    {
        id: 106,
        name: "LFA 6 — Sandbox",
        floor: `1111
1--1
1--1
1116`,
        playerPosition: [0, 0],
        initialRotation: 0,
        permissions: {
            allowLoops: true,
            allowMultipleOutgoing: true,
            stateActionsAllowed: true,
            edgeActionsAllowed: true,
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                image: "lfa/06-sandbox/passo1.png",
                text:
                    "**Modo livre!** Não há restrições de estados, símbolos ou loops. " +
                    "Explore o mapa, crie o autômato que quiser e experimente " +
                    "diferentes cadeias de entrada. O centro está vazio — contorne pelo perímetro.",
            },
            {
                image: "lfa/06-sandbox/passo2.png",
                text:
                    "Use tudo que aprendeu: defina um **estado inicial**, marque **estados finais**, " +
                    "crie **transições** com os símbolos que preferir e experimente **loops** " +
                    "para percorrer trechos repetidos do caminho. Não há resposta errada!",
            },
        ],
    },
];

export const stagesList: Stage[] = [/*...oldStages,*/ ...newStages];
