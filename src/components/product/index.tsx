import "./styles.css"
import { useNavigate } from "react-router"


interface ProductProps {
   product:{
    "id":number;
    "nome": string,
    "marca": string,
    "preco": number,
    "imagem": string
   }
}

export default function Product({product}: ProductProps) {
    const{ nome, marca, preco, imagem, id } = product

    const navigate = useNavigate();

    function onNavigate() {
        navigate(`/produto/${id}`)
    }

    return (
        <div className="container-product" onClick={onNavigate}>
            <h2>{nome}</h2>

            <div className="content-img">
                <img src={imagem} />
            </div>

            <p className="fabricante">{marca}</p>

            <p className="preco">R$ {preco}</p>
        </div>
    )
}