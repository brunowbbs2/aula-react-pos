import { createHmac, timingSafeEqual } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'

interface Usuario {
  id: number
  nome: string
  email: string
  senha: string
}

interface Produto {
  id: number
  nome: string
  categoria: string
  marca: string
  preco: number
  detalhes: string
  imagem: string
}

interface Db {
  usuarios: Usuario[]
  produtos: Produto[]
}

interface JwtPayload {
  sub: number
  email: string
  nome: string
  iat: number
}

const SEED_PATH = fileURLToPath(new URL('./seed.json', import.meta.url))
const DB_PATH = fileURLToPath(new URL('./db.json', import.meta.url))

const JWT_SECRET = 'unyproducts-segredo-do-mock'
const ATRASO_MS = 300
const PORTA = Number(process.env.PORT ?? 3001)

function lerDb(): Db {
  if (!existsSync(DB_PATH)) copyFileSync(SEED_PATH, DB_PATH)
  return JSON.parse(readFileSync(DB_PATH, 'utf8'))
}

function salvarDb(db: Db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')
}

function proximoId(lista: { id: number }[]) {
  return lista.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
}

function semSenha(usuario: Usuario): Omit<Usuario, 'senha'> {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email }
}

function base64url(dado: string | Buffer) {
  return Buffer.from(dado).toString('base64url')
}

function assinar(conteudo: string) {
  return createHmac('sha256', JWT_SECRET).update(conteudo).digest('base64url')
}

function gerarToken(usuario: Usuario) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload: JwtPayload = {
    sub: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    iat: Math.floor(Date.now() / 1000),
  }
  const corpo = `${header}.${base64url(JSON.stringify(payload))}`
  return `${corpo}.${assinar(corpo)}`
}

function verificarToken(token: string): JwtPayload | null {
  const [header, payload, assinatura] = token.split('.')
  if (!header || !payload || !assinatura) return null

  const esperada = Buffer.from(assinar(`${header}.${payload}`))
  const recebida = Buffer.from(assinatura)
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

class HttpError extends Error {
  status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

function enviar(res: ServerResponse, status: number, corpo?: unknown) {
  res.statusCode = status
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (corpo === undefined) return res.end()
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(corpo))
}

async function lerCorpo(req: IncomingMessage): Promise<Record<string, unknown>> {
  const partes: Buffer[] = []
  for await (const parte of req) partes.push(parte as Buffer)
  const texto = Buffer.concat(partes).toString('utf8')
  if (!texto) return {}
  try {
    return JSON.parse(texto)
  } catch {
    throw new HttpError(400, 'JSON inválido')
  }
}

function autenticar(req: IncomingMessage, db: Db) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ')
  if (tipo !== 'Bearer' || !token) throw new HttpError(401, 'Token não informado')

  const payload = verificarToken(token)
  const usuario = payload && db.usuarios.find((u) => u.id === payload.sub)
  if (!usuario) throw new HttpError(401, 'Token inválido')
  return usuario
}

const CAMPOS_TEXTO = ['nome', 'categoria', 'marca', 'detalhes', 'imagem'] as const

function validarProduto(dados: Record<string, unknown>, parcial: boolean) {
  const produto: Partial<Omit<Produto, 'id'>> = {}

  for (const campo of CAMPOS_TEXTO) {
    const valor = dados[campo]
    if (valor === undefined && parcial) continue
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new HttpError(400, `Campo "${campo}" é obrigatório e deve ser texto`)
    }
    produto[campo] = valor.trim()
  }

  if (dados.preco !== undefined || !parcial) {
    const preco = Number(dados.preco)
    if (dados.preco === '' || dados.preco === null || Number.isNaN(preco) || preco < 0) {
      throw new HttpError(400, 'Campo "preco" é obrigatório e deve ser um número >= 0')
    }
    produto.preco = preco
  }

  return produto
}

async function rotasAuth(req: IncomingMessage, res: ServerResponse, caminho: string[], db: Db) {
  const [acao] = caminho

  if (acao === 'register' && req.method === 'POST') {
    const { nome, email, senha } = await lerCorpo(req)
    if (typeof nome !== 'string' || !nome.trim()) throw new HttpError(400, 'Nome é obrigatório')
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'E-mail inválido')
    if (typeof senha !== 'string' || senha.length < 6) throw new HttpError(400, 'A senha deve ter no mínimo 6 caracteres')

    const emailNormalizado = email.trim().toLowerCase()
    if (db.usuarios.some((u) => u.email === emailNormalizado)) throw new HttpError(409, 'E-mail já cadastrado')

    const usuario: Usuario = { id: proximoId(db.usuarios), nome: nome.trim(), email: emailNormalizado, senha }
    db.usuarios.push(usuario)
    salvarDb(db)
    return enviar(res, 201, { token: gerarToken(usuario), usuario: semSenha(usuario) })
  }

  if (acao === 'login' && req.method === 'POST') {
    const { email, senha } = await lerCorpo(req)
    const usuario = db.usuarios.find(
      (u) => u.email === String(email ?? '').trim().toLowerCase() && u.senha === senha,
    )
    if (!usuario) throw new HttpError(401, 'E-mail ou senha incorretos')
    return enviar(res, 200, { token: gerarToken(usuario), usuario: semSenha(usuario) })
  }

  if (acao === 'me' && req.method === 'GET') {
    return enviar(res, 200, semSenha(autenticar(req, db)))
  }

  throw new HttpError(404, 'Rota não encontrada')
}

async function rotasProdutos(
  req: IncomingMessage,
  res: ServerResponse,
  caminho: string[],
  query: URLSearchParams,
  db: Db,
) {
  const [idTexto, extra] = caminho
  if (extra !== undefined) throw new HttpError(404, 'Rota não encontrada')

  if (idTexto === undefined) {
    if (req.method === 'GET') {
      const busca = query.get('q')?.toLowerCase()
      const categoria = query.get('categoria')?.toLowerCase()
      const produtos = db.produtos.filter(
        (p) =>
          (!busca || `${p.nome} ${p.marca}`.toLowerCase().includes(busca)) &&
          (!categoria || p.categoria.toLowerCase() === categoria),
      )
      return enviar(res, 200, produtos)
    }

    if (req.method === 'POST') {
      const dados = validarProduto(await lerCorpo(req), false) as Omit<Produto, 'id'>
      const produto: Produto = { id: proximoId(db.produtos), ...dados }
      db.produtos.push(produto)
      salvarDb(db)
      return enviar(res, 201, produto)
    }

    throw new HttpError(405, 'Método não permitido')
  }

  const id = Number(idTexto)
  const indice = db.produtos.findIndex((p) => p.id === id)
  if (indice === -1) throw new HttpError(404, 'Produto não encontrado')

  switch (req.method) {
    case 'GET':
      return enviar(res, 200, db.produtos[indice])

    case 'PUT':
    case 'PATCH': {
      const dados = validarProduto(await lerCorpo(req), req.method === 'PATCH')
      db.produtos[indice] = { ...db.produtos[indice], ...dados, id }
      salvarDb(db)
      return enviar(res, 200, db.produtos[indice])
    }

    case 'DELETE':
      db.produtos.splice(indice, 1)
      salvarDb(db)
      return enviar(res, 204)

    default:
      throw new HttpError(405, 'Método não permitido')
  }
}

async function tratarRequisicao(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const [grupo, ...caminho] = url.pathname.split('/').filter(Boolean)
  if (req.method === 'OPTIONS') return enviar(res, 204)

  const db = lerDb()

  switch (grupo) {
    case 'auth':
      return rotasAuth(req, res, caminho, db)

    case 'public':
      if (caminho[0] !== 'produtos') break
      return rotasProdutos(req, res, caminho.slice(1), url.searchParams, db)

    case 'produtos':
      autenticar(req, db)
      return rotasProdutos(req, res, caminho, url.searchParams, db)
  }

  throw new HttpError(404, 'Rota não encontrada')
}

createServer((req, res) => {
  setTimeout(() => {
    tratarRequisicao(req, res).catch((erro: unknown) => {
      if (erro instanceof HttpError) return enviar(res, erro.status, { erro: erro.message })
      console.error(erro)
      enviar(res, 500, { erro: 'Erro interno no mock' })
    })
  }, ATRASO_MS)
}).listen(PORTA, () => {
  console.log(`API mock rodando em http://localhost:${PORTA}`)
})
