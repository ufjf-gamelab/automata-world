/**
 * App.tsx — Raiz da aplicação
 *
 * Este componente é o ponto de encontro entre os dois mundos do projeto:
 * o autômato finito (lado esquerdo) e o jogo 3D (lado direito).
 *
 * Por que o estado do jogo vive aqui e não dentro do GameView?
 * Porque o AutomatonEditor precisa despachar ações para o jogo durante
 * a simulação (ex: mover o personagem quando uma transição ocorre).
 * Manter o gameState aqui garante que ambos os componentes compartilhem
 * o mesmo estado sem precisar de um gerenciador global como Redux.
 */
import { useReducer, useState } from "react";
import AutomatonEditor from "./components/automaton/AutomatonEditor";
import GameView from "./components/GameView";
import { gameReducer, createInitialState } from "./components/game/gameReducer";
import { stagesList } from "./components/game/data/Stages";
import type { Stage } from "./components/game/data/types";
import "./global.css";
import "./App.css";

export default function App() {
    // Estado completo do jogo — posição do jogador, botões ativos, vitória, etc.
    const [gameState, gameDispatch] = useReducer(gameReducer, stagesList[0], createInitialState);

    // Último comando executado (ex: "f", "n") — repassado ao Player para acionar a animação correta
    const [currentCommand, setCurrentCommand] = useState("");

    // Troca de fase: reinicia o mapa com a nova fase e limpa o comando atual
    const handleChangeStage = (stage: Stage) => {
        gameDispatch({ type: "RESET_STAGE", payload: { stage, commands: "" } });
        setCurrentCommand("");
    };

    // Avança para a próxima fase da lista, voltando ao início se já estiver na última
    const handleNextStage = () => {
        const currentIndex = stagesList.findIndex((s) => s.id === gameState.activeStage.id);
        const nextStage = stagesList[currentIndex + 1] || stagesList[0];
        gameDispatch({ type: "RESET_STAGE", payload: { stage: nextStage, commands: "" } });
    };

    return (
        <div className="appContainer">
            {/* Metade esquerda: editor do autômato finito + painel de simulação */}
            <div className="automatonWrapper">
                <AutomatonEditor
                    gameDispatch={gameDispatch}
                    setCurrentCommand={setCurrentCommand}
                />
            </div>

            {/* Metade direita: visualização 3D do jogo */}
            <div className="gameWrapper">
                <GameView
                    gameState={gameState}
                    currentCommand={currentCommand}
                    onChangeStage={handleChangeStage}
                    onNextStage={handleNextStage}
                />
            </div>
        </div>
    );
}
