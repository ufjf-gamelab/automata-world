import type { Stage } from "./types";

export const stagesList: Stage[] = [
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
                // Imagem: tela do jogo mostrando os 3 blocos em linha,
                // personagem no bloco esquerdo, botão brilhante no bloco direito.
                // Seta apontando para o botão.
                image: "reta/Gemini_Generated_Image_hpv6dvhpv6dvhpv7.png",
                text: "Bem-vindo ao **Automa World**! Seu objetivo é levar o personagem até o **botão azul** no final do caminho.",
            },
            {
                // Imagem: painel do autômato com os 4 estados já conectados (1→2→3→4),
                // arestas rotuladas "A" com ação "Forward" e a última com ação "Button".
                // Círculo duplo no estado 4 indicando estado final.
                image: "tutorial/reta/passo2.png",
                text: "O **autômato** já está pronto! Cada transição com **A** avança o personagem, e a última aciona o botão. Leia a fita **AAA** e clique em Executar.",
            },
            {
                // Imagem: diagrama explicativo: Estado Inicial ▶, Estado Final ◎,
                // Transição com rótulo e ação. Legenda clara em fundo escuro.
                image: "tutorial/reta/passo3.png",
                text: "Nas próximas fases **você mesmo** vai construir o autômato. Clique com o botão direito em um estado para adicionar novos estados e transições!",
            },
        ],
    },
    {
        id: 3,
        name: "Virando à direita",
        floor: `111
--1
--6`,
        playerPosition: [0, 0],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
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
        // tutorial: [
        //     {
        //         // Imagem: mapa em L invertido com seta mostrando: andar 2 para o leste,
        //         // virar à direita, andar 2 para o sul, apertar botão.
        //         image: "tutorial/virada_direita/passo1.png",
        //         text: "Agora você aprende a **virar à direita** (↻). O caminho vai para o lado e depois para baixo — você precisa girar no momento certo!",
        //     },
        //     {
        //         // Imagem: ícone D com seta curva para a direita, mostrando que D
        //         // rotaciona o personagem 90° no sentido horário.
        //         image: "tutorial/virada_direita/passo2.png",
        //         text: "O símbolo **D** gira o personagem 90° no sentido horário ↻. Leia a fita **FFDFFB**: avança, avança, vira, avança, avança, botão!",
        //     },
        // ],
    },
    {
        id: 2,
        name: "Meia volta",
        floor: `1-6
1-1
111`,
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
        // tutorial: [
        //     {
        //         // Imagem: vista aérea do mapa em L com linha pontilhada
        //         // traçando o caminho do jogador até o botão no canto superior direito.
        //         image: "tutorial/meia_volta/passo1.png",
        //         text: "O caminho agora tem **curvas**! Você precisa virar o personagem na hora certa para chegar ao botão.",
        //     },
        //     {
        //         // Imagem: ícones dos 3 comandos: F (seta verde), E (curva azul), B (botão amarelo).
        //         // Cards coloridos com legenda de cada símbolo.
        //         image: "tutorial/meia_volta/passo2.png",
        //         text: "Você tem 3 símbolos: **F** (frente), **E** (girar à esquerda ↺) e **B** (botão). A fita **FFEFFEFFB** já diz o caminho exato!",
        //     },
        //     {
        //         // Imagem: fita "FFEFFEFFB" exibida como células coloridas
        //         // (F=verde, E=azul, B=amarelo), igual ao tape display do jogo.
        //         image: "tutorial/meia_volta/passo3.png",
        //         text: "Complete o autômato: você precisará de **9 estados** — um para cada símbolo da fita. O último deve ser o **estado final**.",
        //     },
        // ],
    },
    {
        id: 4,
        name: "Zigue-Zague",
        floor: `1116--
---1--
---1--
---116`,
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
                // Imagem: mapa em Z visto de cima com setas numeradas mostrando
                // as 3 fases do percurso: (1) vai para o leste 3 blocos,
                // (2) vira com E e desce 3 blocos, (3) vira com D e vai 2 para o leste.
                // Destaque nas duas viradas em cores diferentes.
                image: "tutorial/ziguezague/passo1.png",
                text: "O percurso forma um **Z**! Você vai para a direita, desce e vai para a direita novamente. São **duas viradas** — uma com E e outra com D.",
            },
            {
                // Imagem: comparação visual E vs D:
                // E: seta curva para a esquerda do personagem (↺)
                // D: seta curva para a direita do personagem (↻)
                // Com exemplos de quando cada um é usado no percurso Z.
                image: "tutorial/ziguezague/passo2.png",
                text: "**E** e **D** giram em sentidos opostos. Observe a fita **FFFEFFFDFFB** — o E vira na descida e o D vira na segunda reta horizontal.",
            },
            {
                // Imagem: o Z desenhado com as 3 seções coloridas:
                // Seção 1 (→→→) em verde, virada E em amarelo, seção 2 (↓↓↓) em azul,
                // virada D em laranja, seção 3 (→→) em verde, botão em vermelho.
                image: "tutorial/ziguezague/passo3.png",
                text: "Monte **11 estados** — um para cada símbolo. Use **F** para andar, **E** e **D** para virar e **B** para o botão. Você consegue!",
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
        // tutorial: [
        //     {
        //         // Imagem: vista lateral dos 3 blocos em degraus (h1, h2, h3) com
        //         // o personagem no bloco mais baixo e setas diagonais mostrando os saltos.
        //         image: "tutorial/escada/passo1.png",
        //         text: "Os blocos estão em **alturas diferentes**! Para subir, você usará o comando **P** (pular), que move o personagem para um bloco que está exatamente **1 nível acima**.",
        //     },
        //     {
        //         // Imagem: comparação P vs F: P sobe um nível (seta diagonal para cima),
        //         // F anda reto ou desce um nível (seta horizontal ou levemente para baixo).
        //         image: "tutorial/escada/passo2.png",
        //         text: "**P** sobe exatamente 1 nível. **F** anda reto ou desce 1 nível. Se a diferença de altura for maior, nenhum dos dois funciona — o personagem fica parado!",
        //     },
        //     {
        //         // Imagem: o autômato esperado: 3 estados P→P→B com o estado 4 como final.
        //         // Diagrama limpo mostrando os 4 estados e suas conexões.
        //         image: "tutorial/escada/passo3.png",
        //         text: "Monte um autômato com **4 estados**: use **P** para subir cada degrau e **B** para apertar o botão no topo. Boa sorte!",
        //     },
        // ],
    },
    {
        id: 6,
        name: "Subida espiral",
        floor: `93
12`,
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
        // tutorial: [
        //     {
        //         // Imagem: grid 2x2 visto isometricamente com as alturas indicadas
        //         // (1, 2, 3, 4) e o personagem no canto inferior esquerdo.
        //         // Seta espiral mostrando a rota.
        //         image: "tutorial/espiral/passo1.png",
        //         text: "O mapa é uma **grade 2x2** com blocos de alturas crescentes. Você precisa subir em espiral — pular, girar, pular, girar — até o botão no topo!",
        //     },
        //     {
        //         // Imagem: a fita "PEPEPB" exibida como células coloridas
        //         // (P=verde, E=azul, B=amarelo). Seta apontando para o campo de fita.
        //         image: "tutorial/espiral/passo2.png",
        //         text: "A fita **PEPEPB** já está definida. O padrão **P-E** se repete 3 vezes: pule um nível, gire à esquerda, pule, gire... e no final aperte o botão!",
        //     },
        //     {
        //         // Imagem: autômato com 6 estados conectados em sequência P,E,P,E,P,B.
        //         // Estado 6 com círculo duplo (final). Diagrama limpo.
        //         image: "tutorial/espiral/passo3.png",
        //         text: "Monte um autômato com **6 estados**, um para cada símbolo. A sequência é P→E→P→E→P→B. O último estado é o final!",
        //     },
        // ],
    },

    // ═══════════════════════════════════════════════════════════════
    // LOOPS
    // ═══════════════════════════════════════════════════════════════

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
        // tutorial: [
        //     {
        //         // Imagem: corredor longo com 8 blocos e uma pergunta visual:
        //         // "8 estados?" com um X vermelho, versus "2 estados com loop?"
        //         // com um ✓ verde. Contraste claro entre as duas abordagens.
        //         image: "tutorial/loop/passo1.png",
        //         text: "O corredor tem **7 blocos** antes do botão. Você poderia criar 8 estados... mas há um jeito mais inteligente: o **self-loop**!",
        //     },
        //     {
        //         // Imagem: diagrama de um self-loop — estado 1 com uma seta curva
        //         // voltando para si mesmo, rotulada "A (forward)". Estado 2 (final)
        //         // conectado por "B (button)". Simples e didático.
        //         image: "tutorial/loop/passo2.png",
        //         text: "Um **self-loop** é uma transição que volta para o mesmo estado! Com apenas **2 estados**, o autômato pode andar indefinidamente e parar quando lê o botão.",
        //     },
        //     {
        //         // Imagem: fita "AAAAAAAB" com as 7 letras A representando os 7 passos
        //         // e B o botão. O autômato ao lado mostrando: estado 1 lê "A" → fica em 1,
        //         // estado 1 lê "B" → vai para estado 2 (final).
        //         image: "tutorial/loop/passo3.png",
        //         text: "Monte o autômato: estado **1** tem um self-loop em **A** (ação: avançar) e uma transição para o estado **2** em **B** (ação: botão). A fita é **AAAAAAAB**.",
        //     },
        // ],
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
        // tutorial: [
        //     {
        //         // Imagem: escada de 5 degraus com alturas 1→2→3→4→5(botão) e o personagem
        //         // no primeiro degrau. Loop indicado por seta circular acima dos degraus.
        //         image: "tutorial/escada_loop/passo1.png",
        //         text: "A escada tem **5 degraus**. Em vez de 5 estados, use um **self-loop com P** — o personagem sobe um degrau de cada vez, independente de quantos sejam!",
        //     },
        //     {
        //         // Imagem: autômato com self-loop em P e saída em B.
        //         // Estado 1 com seta curva (P=pular) e seta para estado 2 (B=botão).
        //         image: "tutorial/escada_loop/passo2.png",
        //         text: "Monte: estado **1** com self-loop em **P** (pular) e transição para estado **2** em **B** (botão). A fita é **PPPPB** — 4 saltos e aperta o botão!",
        //     },
        // ],
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
        // tutorial: [
        //     {
        //         // Imagem: visão lateral dos 7 blocos alternando h1 e h2,
        //         // com setas indicando P (subir) e F (descer/avançar) alternadamente.
        //         image: "tutorial/alternado/passo1.png",
        //         text: "O caminho sobe e desce como uma **montanha-russa**! Você precisa alternar **P** (sobe) e **F** (avança/desce) repetidamente até o botão.",
        //     },
        //     {
        //         // Imagem: ciclo de 2 estados — estado A e estado B com setas
        //         // A→B (P) e B→A (F). Diferente do self-loop: são 2 estados diferentes
        //         // que formam um ciclo. Uma seta de A para C (final) indica B.
        //         image: "tutorial/alternado/passo2.png",
        //         text: "Desta vez, use um **ciclo de 2 estados**: estado **A** (para blocos baixos) vai para estado **B** com P, e **B** volta para **A** com F. 3 estados no total!",
        //     },
        //     {
        //         // Imagem: fita "PFPFPFB" com células coloridas e o autômato de 3 estados
        //         // ao lado: 1--p-->2, 2--f-->1, 1--b-->3(final).
        //         image: "tutorial/alternado/passo3.png",
        //         text: "A fita é **PFPFPFB**. Monte: estado **1** lê P→vai para **2** e lê B→vai para **3**(final). Estado **2** lê F→volta para **1**. É um ciclo!",
        //     },
        // ],
    },
    {
        id: 10,
        name: "Labirinto em U",
        floor: `1-6
1-1
111`,
        playerPosition: [0, 0],
        initialRotation: 0,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 9,
            allowedSymbols: ["f", "d", "b"],
            allowedCommands: ["f", "d", "b"],
            fixedTape: "FFDFFDFFB",
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        // tutorial: [
        //     {
        //         // Imagem: mapa em U visto de cima, com setas mostrando:
        //         // desce 2 (Sul), vira direita (Leste), anda 2, vira direita (Norte),
        //         // sobe 2 até o botão.
        //         image: "tutorial/u/passo1.png",
        //         text: "O caminho forma um **U**! Você desce, atravessa e sobe até o botão. Use **D** (girar à direita ↻) para fazer as duas curvas.",
        //     },
        //     {
        //         // Imagem: fita "FFDFFDFFB" exibida como células coloridas
        //         // com cada grupo de símbolos agrupado (FF=andar, D=virar, etc.).
        //         image: "tutorial/u/passo2.png",
        //         text: "A fita **FFDFFDFFB** descreve o percurso completo. Note que a virada ↻ aparece **duas vezes**. Monte 9 estados, um para cada símbolo!",
        //     },
        // ],
    },
    {
        id: 11,
        name: "Espiral 3x3",
        floor: `948
503
127`,
        playerPosition: [0, 2],
        initialRotation: 1,
        permissions: {
            allowLoops: false,
            allowMultipleOutgoing: false,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 8,
            allowedSymbols: ["f", "d", "b"],
            allowedCommands: ["f", "d", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        // tutorial: [
        //     {
        //         // Imagem: grid 3x3 com a rota em espiral desenhada com seta tracejada:
        //         // [0,2]→[1,2]→[2,2]→vira→[2,1]→[2,0]=botão.
        //         // Setas numeradas indicando a sequência.
        //         image: "tutorial/espiral3x3/passo1.png",
        //         text: "Desta vez **você decide** a fita! Observe o mapa, trace o caminho até o botão e descubra a sequência de comandos. Pista: você precisará de **D** duas vezes.",
        //     },
        //     {
        //         // Imagem: dica visual mostrando o personagem no canto inferior esquerdo
        //         // e o botão no canto superior direito, com a pergunta "Qual é o caminho?".
        //         image: "tutorial/espiral3x3/passo2.png",
        //         text: "Dica: avance para o **Leste**, vire à direita (↻ = Norte), avance até o botão. Quantos **F** você precisa em cada trecho? Monte o autômato e teste!",
        //     },
        // ],
    },
    {
        id: 12,
        name: "Desafio livre",

        floor: `1111
1--1
1--1
1116`,
        playerPosition: [0, 0],
        initialRotation: 0,
        permissions: {
            allowLoops: true,
            allowMultipleOutgoing: true,
            stateActionsAllowed: false,
            edgeActionsAllowed: true,
            maxNodes: 12,
            allowedSymbols: ["f", "d", "e", "b"],
            allowedCommands: ["f", "d", "e", "b"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        // tutorial: [
        //     {
        //         // Imagem: mapa quadrado 4x4 com o centro vazio, personagem no canto
        //         // superior esquerdo e botão no canto inferior direito. Sem setas —
        //         // o jogador deve descobrir o caminho sozinho.
        //         image: "tutorial/desafio/passo1.png",
        //         text: "**Desafio final!** Não há fita definida nem autômato inicial. Explore o mapa, descubra o caminho até o botão e monte o autômato do zero!",
        //     },
        //     {
        //         // Imagem: dica mostrando que o centro está vazio (blocos inválidos),
        //         // então o jogador deve contornar pelo lado de fora do quadrado.
        //         image: "tutorial/desafio/passo2.png",
        //         text: "O centro do mapa está **vazio** — você não pode atravessar! Contorne pelo perímetro. Você pode usar **E** e **D** à vontade. Quantos estados vai precisar?",
        //     },
        // ],
    },
];
