import React, { ForwardedRef } from "react";
import styles from "./ContextMenu.module.css";

export interface MenuItem {
    icon?: string;
    label?: string;
    onClick?: () => void;
    isSeparator?: boolean;
    className?: string;
    disabled?: boolean;
}

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    items: MenuItem[];
    menuRef: ForwardedRef<HTMLDivElement>;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, x, y, items, menuRef }) => {
    if (!isVisible) return null;

    return (
        <div
            ref={menuRef}
            className={styles.contextMenu}
            style={{ top: y, left: x, position: "fixed" }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) =>
                item.isSeparator ? (
                    <hr key={`sep-${index}`} />
                ) : (
                    <button
                        key={item.label}
                        className={`${styles.contextMenuButton} ${item.className || ""} ${
                            item.disabled ? styles.disabled : ""
                        }`}
                        onClick={item.disabled ? undefined : item.onClick}
                        disabled={item.disabled}
                    >
                        {item.icon && <span>{item.icon}</span>}
                        {item.label}
                        {item.disabled && <span className={styles.lockIcon}>🔒</span>}
                    </button>
                ),
            )}
        </div>
    );
};

export default ContextMenu;
