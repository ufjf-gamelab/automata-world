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
                { source: "1", target: "2", label: "a" },
                { source: "2", target: "3", label: "a" },
                { source: "3", target: "4", label: "a" },
            ],
        },
        tutorial: [
            {
                // Imagem: tela cheia do jogo com o personagem parado no início da reta,
                // o mapa visto de cima mostrando os 3 blocos (azul, azul, botão azul brilhante)
                // com uma seta destacando o botão no final.
                image: "reta/passo1.png",
                text: "Bem-vindo ao **Automa World**! Seu objetivo é levar o personagem até o **botão azul** ao final do caminho.",
            },
            {
                // Imagem: close no painel do autômato já montado, com os 4 estados (1→2→3→4)
                // conectados por arestas rotuladas com "A", círculo duplo no estado 4 indicando
                // que é o estado final. Setas apontando para as arestas.
                image: "reta/passo2.png",
                text: "O **autômato** já está montado para você! Cada estado representa uma posição e cada transição com **A** faz o personagem dar um passo para frente.",
            },
            {
                // Imagem: close no painel de simulação com a fita preenchida com "AAA"
                // e o botão verde "Executar" destacado por uma seta ou contorno brilhante.
                image: "reta/passo3.png",
                text: "Digite **AAA** na fita de entrada e clique em **Executar**. O autômato vai ler cada símbolo e mover o personagem a cada passo.",
            },
            {
                // Imagem: sequência mostrando o personagem andando pelos 3 blocos,
                // com o autômato destacando cada estado à medida que avança (estados 1, 2, 3, 4
                // acendem em sequência). Uma animação ou frames lado a lado.
                image: "reta/passo4.png",
                text: "Veja que a cada **A lido** o personagem avança um bloco e o autômato passa para o próximo estado. Três símbolos, três passos!",
            },
            {
                // Imagem: personagem pisando no botão azul, botão aceso/ativo, efeito de vitória
                // (confetes ou brilho). O estado 4 do autômato destacado em verde como estado final aceito.
                image: "reta/passo5.png",
                text: "Ao chegar no **estado final** (estado 4), o personagem pisa no botão e a fase é concluída! O autômato **aceitou** a palavra AAA.",
            },
            {
                // Imagem: diagrama explicativo simples mostrando um autômato genérico
                // com a legenda: "Estado inicial ▶", "Estado final ◎", "Transição →"
                // em fundo claro e limpo, estilo infográfico.
                image: "reta/passo6.png",
                text: "Resumindo: um **autômato finito** é formado por **estados** e **transições**. O estado inicial é de onde partimos e o estado final é onde queremos chegar.",
            },
            {
                // Imagem: tela do jogo com destaque nos controles — painel de simulação
                // à esquerda e o canvas do autômato à direita. Círculos numerados (1, 2, 3)
                // apontando para: fita de entrada, botão Executar e os estados do autômato.
                image: "reta/passo7.png",
                text: "Nas próximas fases **você mesmo** vai construir o autômato. Use o clique direito (ou toque longo) nos estados para adicionar transições. Boa sorte! 🚀",
            },
        ],
    },
    {
        id: 2,
        name: "Meia volta",
        floor: "1-6\n1-1\n111",
        playerPosition: [0, 0],
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
            edges: [{ source: "1", target: "2", label: "F" }],
        },
        tutorial: [
            {
                // Imagem: vista aérea do mapa em formato de "L" com 3 linhas de blocos.
                // O personagem está no canto inferior esquerdo. Uma linha pontilhada traça
                // o caminho que ele deve percorrer até o botão no canto superior direito.
                image: "meia_volta/passo1.png",
                text: "Agora o caminho tem **curvas**! Você precisa guiar o personagem por este percurso em L até o **botão azul** no canto.",
            },
            {
                // Imagem: os símbolos disponíveis (F, E, B) com ícones grandes e coloridos:
                // F = seta para frente (verde), E = seta curva para esquerda (azul),
                // B = ícone de botão/interação (amarelo). Fundo escuro estilo card de tutorial.
                image: "meia_volta/passo2.png",
                text: "Nesta fase você tem três comandos: **F** (avançar), **E** (girar à esquerda ↺) e **B** (apertar o botão). Use-os nas transições do autômato.",
            },
            {
                // Imagem: a fita já preenchida "FFEFFEFFB" com cada letra colorida
                // de acordo com o comando — F em verde, E em azul, B em amarelo.
                // Uma seta aponta para o campo de fita no painel de simulação.
                image: "meia_volta/passo3.png",
                text: "A fita já está definida: **FFEFFEFFB**. Ela representa exatamente a sequência de movimentos necessária para percorrer o caminho completo.",
            },
            {
                // Imagem: diagrama mostrando o trecho F→F do caminho (andar 2 blocos reto),
                // depois E (girar à esquerda), depois F→F (andar mais 2 blocos),
                // depois E de novo, depois F→F e por fim B. Estilo mapa com setas.
                image: "meia_volta/passo4.png",
                text: "Leia a fita como um **roteiro de passos**: anda, anda, vira, anda, anda, vira, anda, anda, aperta o botão. Cada símbolo é uma instrução!",
            },
            {
                // Imagem: o autômato parcialmente montado (apenas a primeira transição 1→2 com F)
                // e um "?" grande indicando os próximos estados a serem criados.
                // Destaque nos estados 1 e 2 já existentes.
                image: "meia_volta/passo5.png",
                text: "O autômato começa com o estado **1→2** usando **F**. Sua tarefa é continuar construindo os estados e transições para cada símbolo da fita.",
            },
            {
                // Imagem: instrução visual de como criar uma nova transição — clique direito
                // num estado, menu de contexto aparecendo com "Add & Link New State" destacado.
                // Captura de tela ou mockup com seta apontando para a opção.
                image: "meia_volta/passo6.png",
                text: "Para criar um novo estado, clique com o **botão direito** (ou toque longo) em um estado existente e escolha **Add & Link New State**.",
            },
            {
                // Imagem: autômato completo com 9 estados conectados em sequência,
                // cada aresta rotulada com o símbolo correto (F, F, E, F, F, E, F, F, B).
                // O último estado destacado em verde como estado final.
                image: "meia_volta/passo7.png",
                text: "O autômato completo terá **9 estados** e **9 transições**, uma para cada símbolo da fita. O último estado deve ser marcado como **estado final**.",
            },
        ],
    },
    {
        id: 3,
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
            allowedCommands: ["b", "p"],
        },
        initialGraph: {
            nodes: [{ id: "1", label: "1", isInitial: true, isFinal: false }],
            edges: [],
        },
        tutorial: [
            {
                // Imagem: vista lateral do mapa mostrando os 3 blocos em alturas crescentes
                // (degrau 1, degrau 2, degrau 3 com botão no topo). O personagem está
                // no bloco mais baixo. Setas indicando a direção de subida.
                image: "escada/passo1.png",
                text: "Hora de **subir uma escada**! O caminho tem blocos em alturas diferentes. Você precisa saltar de degrau em degrau até o botão no topo.",
            },
            {
                // Imagem: dois ícones grandes lado a lado — P (salto, com seta para cima
                // e para frente) e B (botão, com ícone de mão pressionando). Cada um
                // com fundo colorido e legenda clara.
                image: "escada/passo2.png",
                text: "Nesta fase você tem apenas **P** (pular para o bloco à frente que está **um nível acima**) e **B** (apertar o botão). Simples, mas preciso!",
            },
            {
                // Imagem: diagrama mostrando P como movimento diagonal — personagem
                // salta do bloco de altura 1 para o bloco de altura 2, e depois
                // do bloco de altura 2 para o de altura 3. Setas diagonais coloridas.
                image: "escada/passo3.png",
                text: "O comando **P** só funciona se o bloco à frente estiver exatamente **um nível mais alto**. Se a diferença for maior ou menor, o personagem não se move!",
            },
            {
                // Imagem: o autômato que o jogador deve construir (estado 1, depois 2
                // conectado por P, depois 3 conectado por P, depois 4 conectado por B,
                // estado 4 como final). Diagrama limpo com os rótulos visíveis.
                image: "escada/passo4.png",
                text: "Construa um autômato com **4 estados**: use **P** para subir os dois degraus e **B** para pressionar o botão no topo. Você consegue!",
            },
        ],
    },
    {
        id: 4,
        name: "Subida espiral",
        floor: "93\n12",
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
                // Imagem: vista isométrica do mapa 2x2 com alturas visíveis:
                // bloco [0,1]=1, [1,1]=2, [0,0]=4, [1,0]=8→=3. O personagem está
                // no canto inferior esquerdo (altura 1). O botão no canto superior
                // direito (altura mais alta). Setas mostrando a rota espiral.
                image: "espiral/passo1.png",
                text: "Bem-vindo à **Subida Espiral**! O mapa é uma grade 2x2 com blocos de alturas diferentes. Você deve subir em espiral até o botão no alto.",
            },
            {
                // Imagem: os três símbolos disponíveis P, E, B com ícones grandes:
                // P = salto diagonal para cima (verde), E = rotação anti-horária (azul),
                // B = botão (amarelo). Layout de cards coloridos.
                image: "espiral/passo2.png",
                text: "Seus comandos são **P** (pular um nível acima), **E** (girar 90° à esquerda ↺) e **B** (apertar o botão). Combine-os para subir a espiral!",
            },
            {
                // Imagem: a fita "PEPEPB" exibida horizontalmente com cada letra
                // em uma célula colorida (P=verde, E=azul, B=amarelo), igual ao
                // tape display do jogo. Uma seta aponta para a fita no painel.
                image: "espiral/passo3.png",
                text: "A fita já está definida: **PEPEPB**. O padrão se repete — pule, gire, pule, gire — até chegar no topo e pressionar o botão.",
            },
            {
                // Imagem: o percurso passo a passo no mapa com o personagem em cada posição
                // após cada comando. 6 frames pequenos numerados (P→E→P→E→P→B)
                // mostrando o personagem subindo em espiral pelos 4 blocos.
                image: "espiral/passo4.png",
                text: "Veja o caminho: **P** sobe um bloco, **E** gira para a próxima direção, **P** sobe outro bloco... Repita até chegar no topo e usar **B**!",
            },
            {
                // Imagem: autômato com 6 estados conectados em sequência com rótulos
                // P, E, P, E, P, B. O estado 6 como estado final (círculo duplo).
                // Diagrama limpo com seta indicando onde começar a construir.
                image: "espiral/passo5.png",
                text: "Construa o autômato com **6 estados**, um para cada símbolo da fita. A sequência é P→E→P→E→P→B. O último estado deve ser o **estado final**.",
            },
        ],
    },
];
