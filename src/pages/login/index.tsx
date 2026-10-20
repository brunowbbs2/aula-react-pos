import {useState} from "react"
import {useNavigate} from "react-router"
import "./styles.css"

export default function Login(){
    const[email, setEmail] = useState("");
    const[senha, setSenha] = useState("");

    const navigate = useNavigate()

    function onsubmit(){
        navigate("/home")
        // alert(senha)
    }
    
    return(
    <div className="container-login">
        <form className="container-form-login">
            <h1>Login</h1>

            <p>Informe seus dados corretamente para acessar o sistema.</p>

            <input placeholder="Digite o e-mail" 
                value={email} onChange={(evento)=>setEmail(evento.target.value)}/>

            <input type="password"  placeholder="Digite a senha" 
                value={senha} onChange={(evento)=>setSenha(evento.target.value)}/>

            <button type="button" onClick={onsubmit}>Entrar</button>
        </form>
    </div>
    )
}