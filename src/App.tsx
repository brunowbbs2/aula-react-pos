import Login from "./pages/login"
import Home from "./pages/home"
import Detalhes from "./pages/detalhes"

import {BrowserRouter, Routes, Route} from "react-router"

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App(){
  return(
     <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/produto/:id" element={<Detalhes/>}/>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}