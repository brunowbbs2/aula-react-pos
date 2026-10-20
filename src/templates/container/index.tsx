import "./styles.css"

interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({children}:ContainerProps){
    return(
        <div className="container-content">
            <header className="container-header">
                <h1>UnyProducts</h1>

                <nav>
                    <ul>
                        <li>Produtos</li>
                        <li>Quem somos</li>
                        <li>Sair</li>
                    </ul>
                </nav>
            </header>

            <div className="content-children">
                {children}
            </div>

            <footer className="container-footer">
                <p>Todos os direitos reservados</p>
            </footer>

        </div>
    )
}