// src/components/ContextMenu.tsx
import React, { ForwardedRef } from "react";
import styles from "./ContextMenu.module.css"; // Import module

export interface MenuItem {
    icon?: string;
    label?: string; // Optional
    onClick?: () => void; // Optional
    isSeparator?: boolean;
    className?: string; // e.g., styles.textRed600
}

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    items: MenuItem[];
    menuRef: ForwardedRef<HTMLDivElement>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, x, y, items, menuRef }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={menuRef}
            className={styles.contextMenu} // Use module class
            style={{ top: y, left: x, position: "fixed" }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) =>
                item.isSeparator ? (
                    <hr key={`sep-${index}`} /> // hr doesn't need module style
                ) : (
                    <button
                        key={item.label}
                        // Combine base button class with specific class from item prop
                        className={`${styles.contextMenuButton} ${item.className || ""}`}
                        onClick={item.onClick}
                    >
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                    </button>
                )
            )}
        </div>
    );
};

export default ContextMenu;
