import "./styles.css"
import Container from "../../templates/container"

import {toastError, toastSucess} from "../../utils/toast"

import { useMutation } from "@tanstack/react-query"

import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type ProdutoReponse from "../home/types";
import { FiEdit, FiTrash } from "react-icons/fi";

import Modal from "../../components/modal";
import { useState } from "react";
import { api } from "../../services/api"

import { useNavigate } from "react-router"

export default function Detalhes() {

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false)

    const params = useParams()

    function openModal() {
        setIsModalOpen(true)
    }

    function closeModal() {
        setIsModalOpen(false)
    }


    async function removeProduct() {
        return await api.delete(`/produtos/${params.id}`)
    }

    const deleteMutation = useMutation({
        mutationFn: removeProduct,
        onSuccess: () => {
            toastSucess("Produto removido com sucesso!")
            closeModal()
            navigate(-1)
        },
        onError: () => {
            toastError("Erro ao tentar remover o produto!")
        },  
    })


    async function getProductDetail() {

        return api.get<ProdutoReponse>(`produtos/${params.id}`)
    }

    const query = useQuery({ queryKey: ["product-detail"], queryFn: getProductDetail })

    function handleMutate(){
        deleteMutation.mutate()
    }

    return (
        <Container>

            <div>
                {query.isFetching ? <p>Carregando detalhes do produto</p> : (
                    <div>
                        <p>{query.data?.data.nome}</p>

                        <div>
                            <FiEdit />
                            <FiTrash className="icon-delete" onClick={openModal} />

                        </div>

                        <img src={query.data?.data.imagem} />
                        <p>{query.data?.data.categoria}</p>
                        <p>{query.data?.data.detalhes}</p>
                    </div>
                )}
            </div>

            <Modal closeModal={closeModal} isModalOpen={isModalOpen}>
                <h3>Tem certeza que deseja excluir esse item?</h3>

                <div style={{ display: "flex", justifyContent: "space-evenly", marginTop: 30 }}>
                    {deleteMutation.isPending ? <p>Apagando...</p> : <button onClick={handleMutate}>Sim</button>}
                    <button onClick={closeModal}>Não</button>
                </div>
            </Modal>
        </Container>
    )
}