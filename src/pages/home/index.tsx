import "./styles.css"
import axios from "axios";

import Container from "../../templates/container"
import Product from "../../components/product"
import { useQuery } from "@tanstack/react-query";
import type ProdutoReponse from "./types";


export default function Home() {

  async function getProducts() {
    return await axios.get<ProdutoReponse[]>("http://localhost:3001/public/produtos");
  }

   const query = useQuery({ queryKey: ['produtos'], queryFn: getProducts })


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