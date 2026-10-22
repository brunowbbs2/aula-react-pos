import axios from "axios";
import { useState } from "react"
import { useNavigate } from "react-router"
import "./styles.css"

export interface ResponseAuth {
    "token": string,
    "usuario": { "id": number, "nome": string, "email": string }
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const navigate = useNavigate()

    async function authLogin() {
        const response = await axios.post<Promise<ResponseAuth>>("http://localhost:3001/auth/login",
            { email, senha }
        )

        if (response.status !== 200) {
            alert("Usuário e/ou senha inválido(s)")
            return;
        }

        localStorage.setItem("@unyproducts_user_data", JSON.stringify(response.data))

        navigate("/home")
    }

    function onsubmit() {
        authLogin()
        // navigate("/home")
        // alert(senha)
    }

    return (
        <div className="container-login">
            <form className="container-form-login">
                <h1>Login</h1>

                <p>Informe seus dados corretamente para acessar o sistema.</p>

                <input placeholder="Digite o e-mail"
                    value={email} onChange={(evento) => setEmail(evento.target.value)} />

                <input type="password" placeholder="Digite a senha"
                    value={senha} onChange={(evento) => setSenha(evento.target.value)} />

                <button type="button" onClick={onsubmit}>Entrar</button>
            </form>
        </div>
    )
}