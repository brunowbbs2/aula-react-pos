import "./styles.css"
import {api} from "../../services/api"

import Container from "../../templates/container"
import Product from "../../components/product"
import { useQuery } from "@tanstack/react-query";
import type ProdutoReponse from "./types";


export default function Home() {

  async function getProducts() {  
    return await api.get<ProdutoReponse[]>("/produtos");
  }

   const query = useQuery({ queryKey: ['produtos'], queryFn: getProducts, retry:false })


  return (
    <div>
      <Container>

        <h1>Produtos</h1>

        <div className="home-container-list">

         {query.isFetching ? <p>Carregando...</p>: <>{query.data?.data.map((produto)=><Product key={produto.id} product={produto}/>)}</>}

        </div>

      </Container>
    </div>
  )
}

//CHILDREN