import { useState, useContext } from "react";
import Modal from "../../components/modal";
import "./styles.css"
import Cart from "../../components/cart";
import { CartContext } from "../../contexts/cartContext";

interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({children}:ContainerProps){

    const [visibleModal, setVisibleModal]= useState(false)

    const {items} = useContext(CartContext)

    return(
        <div className="container-content">
            <header className="container-header">
                <h1>UnyProducts</h1>

                <nav>
                    <ul>
                        <li>Produtos</li>
                        <li>Quem somos</li>
                        <li onClick={()=>setVisibleModal(true)}>Carrinho de compras - {items.length}</li>
                        <li>Sair</li>
                    </ul>
                </nav>
            </header>

            <div className="content-children">
                {children}
            </div>

            <footer className="container-footer">
                <p>Todos os direitos reservados</p>
            </footer>

            <Modal isModalOpen={visibleModal} closeModal={()=>setVisibleModal(false)}>
                <h3>Carrinho de compras</h3>
                <Cart/>

            </Modal>

        </div>
    )
}