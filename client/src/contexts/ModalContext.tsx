import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { Modal } from "../components/Modal/Modal";

interface ModalContextData {
    showAlert: (message: string, title?: string) => void;
    showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState<"alert" | "confirm">("alert");
    const resolver = useRef<((value: boolean) => void) | null>(null);

    const showAlert = (message: string, title: string = "Aviso") => {
        setModalMessage(message);
        setModalTitle(title);
        setModalType("alert");
        setIsOpen(true);
    };

    const showConfirm = (message: string, title: string = "Confirmação"): Promise<boolean> => {
        setModalMessage(message);
        setModalTitle(title);
        setModalType("confirm");
        setIsOpen(true);

        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolver.current) {
            resolver.current(true);
            resolver.current = null;
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolver.current) {
            resolver.current(false);
            resolver.current = null;
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {isOpen && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    type={modalType}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);
