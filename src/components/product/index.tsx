import "./styles.css"
import {useContext} from "react"
import { useNavigate } from "react-router"
import { CartContext } from "../../contexts/cartContext";


interface ProductProps {
    product: {
        "id": number;
        "nome": string,
        "marca": string,
        "preco": number,
        "imagem": string
    }
}

export default function Product({ product }: ProductProps) {
    const { nome, marca, preco, imagem, id } = product

    const {addItemToCart} = useContext(CartContext)

    const navigate = useNavigate();

    function onNavigate() {
        navigate(`/produto/${id}`)
    }

    return (
        <div className="container-product" >
            <div onClick={onNavigate}>
                <h2>{nome}</h2>

                <div className="content-img">
                    <img src={imagem} />
                </div>

                <p className="fabricante">{marca}</p>

                <p className="preco">R$ {preco}</p>
            </div>
            <button onClick={()=>addItemToCart({id:id, nome:nome,preco:preco})}>Add to cart</button>
        </div>
    )
}