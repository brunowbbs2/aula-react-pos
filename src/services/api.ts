import axios from "axios"
import type { ResponseAuth } from "../pages/login";

export const api = axios.create({ baseURL: "http://localhost:3001" })

const userData = localStorage.getItem("@unyproducts_user_data")
let token;

if (userData) {
    const dataJSON: ResponseAuth = JSON.parse(userData);
    token = dataJSON.token
} else {
    alert("Voce nao possui autorização para acessar essa página")
}

api.defaults.headers.common["Authorization"] = `Bearer ${token}`