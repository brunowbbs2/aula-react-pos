import {useContext} from "react"
import { CartContext } from "../../contexts/cartContext"

export default function Cart(){
    const {items,clearCart} = useContext(CartContext);

    return(
        <div style={{maxHeight:500}}>
            <h1>Carrinho de compras</h1>
            <button onClick={clearCart}>Limpar Carrinho</button>
           {items.map((item)=>(
            <div style={{border:"1px solid #888"}}>
                <h5>{item.nome}</h5>
                <h6>{item.preco}</h6>
            </div>
           ))}
        </div>
    )
}