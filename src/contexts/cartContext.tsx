import {createContext, useState, type ReactNode} from "react"

/*
    [
        {id:1, nome:"", preco:""},
        {id:1, nome:"", preco:""}
    ]

*/

interface CartProps{
    items:{id:number, nome:string, preco:number}[]
    addItemToCart:(item:ItemProps)=>void
    clearCart:()=>void
}

interface ProviderProps{
    children:ReactNode
}

/*
const pessoas = [{nome:"Wesley", idade:18}, {nome:"Ana", idade:12}]
const alunos = [...pessoas, {nome:"Andre", idade:29},{nome:"Andre", idade:29}];
*/

interface ItemProps{
     id:number, 
     nome:string, 
     preco:number
}

//REDUX - ZUSTAND

export const CartContext = createContext<CartProps>(null as any)

export default function CartProvider({children}:ProviderProps){


    const [itemsCart, setItemsCart] = useState<ItemProps[]>([])

    function addItemToCart(item:ItemProps){    
        setItemsCart([...itemsCart, item])
    }

    function clearCart(){
        setItemsCart([])
    }


    return(
        <CartContext.Provider value={{items:itemsCart, addItemToCart:addItemToCart, clearCart:clearCart}}>
            {children}
        </CartContext.Provider>
    )
}