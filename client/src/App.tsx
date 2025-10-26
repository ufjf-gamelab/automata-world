// src/App.tsx
import AutomatonEditor from "./components/AutomatonEditor";
import "./global.css"; // Import global styles (body, etc.)
import "./App.css"; // Import App specific styles (might be empty)

function App() {
    // If you need a wrapper div for App specific layout/styling:
    // return <div className="appRoot"><AutomatonEditor /></div>;
    return <AutomatonEditor />;
}

export default App;