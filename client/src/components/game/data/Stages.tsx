import type { Stage } from "./types";

// ═══════════════════════════════════════════════════════════════
//  DESAFIOS — fases extras para exploração livre
// ═══════════════════════════════════════════════════════════════
const oldStages: Stage[] = [
    {
        id: 1,
        name: "Reta simples",
        floor: "116",
        initialRotation: 1,
        playerPosition: [0, 0],
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
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
    },
    {
        id: 2,
        name: "Virando à direita",
        floor: `111\n--1\n--6`,
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 6,
            allowedSymbols: ["f", "d", "b"],
            allowedCommands: ["f", "d", "b"],
            fixedTape: "FFDFFB",
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "O caminho vira. Monte o autômato para que o personagem chegue ao botão usando a fita **FFDFFB**.",
            },
        ],
    },
    {
        id: 3,
        name: "Meia volta",
        floor: `1-6\n1-1\n111`,
        playerPosition: [0, 0],
        initialRotation: 0,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 9,
            allowedSymbols: ["f", "e", "b"],
            allowedCommands: ["f", "b", "e", "d"],
            fixedTape: "FFEFFEFFB",
        },
        initialGraph: {
            nodes: [
                { id: "1", label: "1", isInitial: true, isFinal: false },
                { id: "2", label: "2", isInitial: false, isFinal: false },
                { id: "3", label: "3", isInitial: false, isFinal: false },
                { id: "4", label: "4", isInitial: false, isFinal: false },
            ],
            edges: [{ source: "1", target: "2", label: "f", action: "f" }],
        },
        tutorial: [
            {
                text: "O mapa tem curvas. Uma transição já está pronta — complete o autômato para percorrer o caminho e chegar ao botão.",
            },
        ],
    },
    {
        id: 4,
        name: "Zigue-Zague",
        floor: `1116--\n---1--\n---1--\n---116`,
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 11,
            allowedSymbols: ["f", "e", "d", "b"],
            allowedCommands: ["f", "e", "d", "b"],
            fixedTape: "FFFEFFFDFFB",
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "O percurso forma um **Z** com duas viradas. Monte o autômato do zero — analise a fita e o mapa para descobrir a sequência de ações.",
            },
        ],
    },
    {
        id: 5,
        name: "Pequena escada",
        floor: "128",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 4,
            allowedSymbols: ["p", "b"],
            allowedCommands: ["p", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                image: "tutorial/stairs/passo1.png",
                text: "Agora o personagem precisa **subir**. Use os comandos disponíveis e monte o autômato para chegar ao botão no topo.",
            },
        ],
    },
    {
        id: 6,
        name: "Subida espiral",
        floor: `93\n12`,
        playerPosition: [0, 1],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 6,
            allowedSymbols: ["p", "e", "b"],
            allowedCommands: ["p", "b", "e", "d"],
            fixedTape: "PEPEPB",
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Subida em espiral — o caminho sobe e vira ao mesmo tempo. A fita já está definida, mas o autômato é por sua conta.",
            },
        ],
    },
    {
        id: 7,
        name: "Corredor infinito",
        floor: "11111116",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: true,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 2,
            allowedSymbols: ["a", "b"],
            allowedCommands: ["f", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Corredor longo, mas apenas **2 estados**. Como fazer o personagem percorrer tudo com tão poucos estados? Pense em **loops**.",
            },
        ],
    },
    {
        id: 8,
        name: "Escada sem fim",
        floor: "12340",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: true,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 2,
            allowedSymbols: ["p", "b"],
            allowedCommands: ["p", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Cinco degraus de alturas diferentes com só **2 estados**. Descubra como um único loop pode cobrir todos os degraus.",
            },
        ],
    },
    {
        id: 9,
        name: "Degraus alternados",
        floor: "1212127",
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 3,
            allowedSymbols: ["p", "f", "b"],
            allowedCommands: ["p", "f", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Degraus que sobem e descem em alternância. Com **3 estados** e múltiplas saídas, encontre o padrão que se repete.",
            },
        ],
    },
    {
        id: 10,
        name: "Labirinto em U",
        floor: `1-6\n1-1\n111`,
        playerPosition: [0, 0],
        initialRotation: 0,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 9,
            allowedSymbols: ["f", "e", "b"],
            allowedCommands: ["f", "e", "b"],
            fixedTape: "FFEFFEFFB",
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Formato em **U** — desce, vira e sobe. Monte o autômato do zero para percorrer o caminho inteiro até o botão.",
            },
        ],
    },
    {
        id: 11,
        name: "Espiral 3x3",
        floor: `948\n503\n127`,
        playerPosition: [0, 2],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 8,
            allowedSymbols: ["f", "e", "b", "p"],
            allowedCommands: ["f", "e", "b", "p"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                text: "Espiral 3×3 com alturas variadas. Trace o caminho no mapa antes de montar o autômato — quantas viradas você vai precisar?",
            },
        ],
    },
    // {
    //     id: 12,
    //     name: "Desafio livre",
    //     floor: `1111\n1--1\n1--1\n1116`,
    //     playerPosition: [0, 0],
    //     initialRotation: 0,
    //     permissions: {
    //         allowLoops: true,
    //         allowMultipleOutgoing: true,
    //         stateActionsAllowed: false,
    //         edgeActionsAllowed: true,
    //         maxNodes: 12,
    //         allowedSymbols: ["f", "d", "e", "b"],
    //         allowedCommands: ["f", "d", "e", "b"],
    //     },
    //     initialGraph: {
    //         nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
    //         edges: [],
    //     },
    //     tutorial: [
    //         {
    //             text: "Mapa quadrado com o centro vazio. Sem restrições de solução — encontre o caminho que quiser e construa o autômato para percorrê-lo.",
    //         },
    //     ],
    // },
];

// ═══════════════════════════════════════════════════════════════
//  FASES LFA — PROGRESSÃO PEDAGÓGICA
// ═══════════════════════════════════════════════════════════════
const newStages: Stage[] = [
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
                    "Execute a fita 'aaaa' e veja o personagem percorrer os blocos " +
                    "e apertar o botão ao chegar no estado final.",
            },
        ],
    },
    {
        id: 103,
        name: "LFA 3 — Transições",
        floor: `-6\n11`,
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
    {
        id: 105,
        name: "LFA 5 — AFD completo",
        floor: `116\n1--`,
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
    {
        id: 106,
        name: "LFA 6 — Sandbox",
        floor: `1111\n1--1\n1--1\n1116`,
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

export const stagesList: Stage[] = [...newStages, ...oldStages];
