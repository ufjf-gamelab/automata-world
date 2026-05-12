import { useTheme } from "../../../contexts/ThemeContext";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            className={styles.btn}
            onClick={toggleTheme}
            title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
            aria-label="Alternar tema"
        >
            {isDark ? "☀️" : "🌙"}
        </button>
    );
}
