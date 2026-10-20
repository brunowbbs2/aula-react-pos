import "./styles.css"
import Container from "../../templates/container"

import { useParams } from "react-router";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type ProdutoReponse from "../home/types";
import { FiEdit, FiTrash } from "react-icons/fi";

import Modal from 'react-modal';
import { useState } from "react";

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

Modal.setAppElement('#root');


export default function Detalhes() {

    const [isModalOpen, setIsModalOpen] = useState(false)

    const params = useParams()

    function openModal(){
        setIsModalOpen(true)
    }

    function closeModal(){
        setIsModalOpen(false)
    }


    async function getProductDetail() {
        return axios.get<ProdutoReponse>(`http://localhost:3001/public/produtos/${params.id}`)
    }

    const query = useQuery({ queryKey: ["product-detail"], queryFn: getProductDetail })

    return (
        <Container>



            <div>
                {query.isFetching ? <p>Carregando detalhes do produto</p> : (
                    <div>
                        <p>{query.data?.data.nome}</p>

                        <div>
                            <FiEdit />
                            <FiTrash className="icon-delete" onClick={openModal} />
                            {/* <button>Editar</button> */}
                            {/* <button>Apagar</button> */}
                        </div>

                        <img src={query.data?.data.imagem} />
                        <p>{query.data?.data.categoria}</p>
                        <p>{query.data?.data.detalhes}</p>
                    </div>
                )}
            </div>

            <Modal onRequestClose={closeModal} isOpen={isModalOpen} style={customStyles}>
                <h3>Tem certeza que deseja excluir esse item?</h3>

                <div style={{display:"flex", justifyContent:"space-evenly", marginTop:30}}>
                    <button>Sim</button>
                    <button onClick={closeModal}>Não</button>
                </div>
            </Modal>
        </Container>
    )
}