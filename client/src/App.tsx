import { useReducer, useState } from "react";
import AutomatonEditor from "./components/automaton/AutomatonEditor";
import GameView from "./components/GameView";
import { gameReducer, createInitialState } from "./components/game/gameReducer";
import { stagesList } from "./components/game/data/Stages";
import { useCustomStages } from "./components/game/data/useCustomStages.ts";
import type { Stage } from "./components/game/data/types";
import "./styles/global.css";
import "./styles/App.css";

export default function App() {
    const [gameState, gameDispatch] = useReducer(gameReducer, stagesList[0], createInitialState);
    const [currentCommand, setCurrentCommand] = useState("");

    const { customStages, saveStage, deleteStage } = useCustomStages();

    const handleChangeStage = (stage: Stage) => {
        gameDispatch({ type: "RESET_STAGE", payload: { stage, commands: "" } });
        setCurrentCommand("");
    };

    const handleNextStage = () => {
        const allStages = [...stagesList, ...customStages];
        const currentIndex = allStages.findIndex((s) => s.id === gameState.activeStage.id);
        const nextStage = allStages[currentIndex + 1] || stagesList[0];
        gameDispatch({ type: "RESET_STAGE", payload: { stage: nextStage, commands: "" } });
    };

    return (
        <div className="appContainer">
            <div className="automatonWrapper">
                <AutomatonEditor
                    key={gameState.activeStage.id}
                    gameDispatch={gameDispatch}
                    setCurrentCommand={setCurrentCommand}
                    activeStage={gameState.activeStage}
                />
            </div>

            <div className="gameWrapper">
                <GameView
                    gameState={gameState}
                    currentCommand={currentCommand}
                    onChangeStage={handleChangeStage}
                    onNextStage={handleNextStage}
                    customStages={customStages}
                    onSaveCustomStage={saveStage}
                    onDeleteCustomStage={deleteStage}
                />
            </div>
        </div>
    );
}
