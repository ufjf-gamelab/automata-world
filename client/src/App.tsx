import { dia, shapes } from "@joint/core";
import { createElements, createLinks } from "@joint/react";
import "./App.css";

function App() {
    const namespace = shapes;

    const graph = new dia.Graph({}, { cellNamespace: namespace });

    const paper = new dia.Paper({
        el: document.getElementById("paper"),
        model: graph,
        width: "90vw",
        height: "90vh",
        background: { color: "#F5F5F5" },
        cellViewNamespace: namespace,
    });

    return <div id="paper"></div>;
}

export default App;
