import type { ReactNode } from 'react';
import ExternalModal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

ExternalModal.setAppElement('#root');

interface ExternalModalProps {
    closeModal: () => void
    isModalOpen: boolean
    children: ReactNode
}

export default function Modal({ closeModal, isModalOpen, children }: ExternalModalProps) {
    return (
        <ExternalModal onRequestClose={closeModal} isOpen={isModalOpen} style={customStyles}>
            {children}
        </ExternalModal>
    )
}