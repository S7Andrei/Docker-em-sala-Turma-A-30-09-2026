import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

type Evento = { id: number, nome: string, vagas: number }
type Inscricao = { eventoId: number, nome: string, criadaEm: string }
type ObjetoJson = Record<string, unknown>

const turma: string = 'A'
const porta: number = Number(process.env.PORT ?? '4000')
const catalogo: string = join(process.cwd(), 'dados', 'eventos.json')
const registros: string = join(process.cwd(), 'registros', 'inscricoes.json')

const ehEvento = (valor: unknown): valor is Evento => {
  if (typeof valor !== 'object' || valor === null) return false
  const item: ObjetoJson = valor as ObjetoJson
  return typeof item.id === 'number' && typeof item.nome === 'string'
    && typeof item.vagas === 'number'
}

const responder = (resposta: ServerResponse, codigo: number, corpo: unknown): void => {
  resposta.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' })
  resposta.end(JSON.stringify(corpo, null, 2))
}

const lerEventos = async (): Promise<Evento[]> => {
  const dados: unknown = JSON.parse(await readFile(catalogo, 'utf8'))
  if (!Array.isArray(dados) || !dados.every(ehEvento)) {
    throw new Error('Formato do catalogo invalido')
  }
  return dados
}

const lerInscricoes = async (): Promise<Inscricao[]> => {
  try {
    return JSON.parse(await readFile(registros, 'utf8')) as Inscricao[]
  } catch (erro: unknown) {
    if ((erro as { code?: string }).code === 'ENOENT') return []
    throw erro
  }
}

const lerCorpo = async (pedido: IncomingMessage): Promise<ObjetoJson> => {
  const partes: Buffer[] = []
  for await (const parte of pedido) partes.push(parte as Buffer)
  const corpo: unknown = JSON.parse(Buffer.concat(partes).toString('utf8') || '{}')
  return typeof corpo === 'object' && corpo !== null ? corpo as ObjetoJson : {}
}

const listarEventos = async (resposta: ServerResponse): Promise<void> => {
  const eventos: Evento[] = await lerEventos()
  const inscricoes: Inscricao[] = await lerInscricoes()
  const itens = eventos.map((evento: Evento) => {
    const inscritos: number = inscricoes.filter((i: Inscricao) => i.eventoId === evento.id).length
    return { ...evento, inscritos, restantes: evento.vagas - inscritos }
  })
  responder(resposta, 200, { turma, total: itens.length, itens })
}

const inscrever = async (pedido: IncomingMessage, resposta: ServerResponse): Promise<void> => {
  const corpo: ObjetoJson = await lerCorpo(pedido)
  const eventoId: number = Number(corpo.eventoId)
  const nome: string = String(corpo.nome ?? '').trim()
  const evento: Evento | undefined = (await lerEventos()).find((e: Evento) => e.id === eventoId)
  if (evento === undefined || nome === '') {
    responder(resposta, 400, { erro: 'Informe eventoId existente e nome' })
    return
  }
  const inscricoes: Inscricao[] = await lerInscricoes()
  if (inscricoes.filter((i: Inscricao) => i.eventoId === eventoId).length >= evento.vagas) {
    responder(resposta, 409, { erro: 'Evento sem vagas' })
    return
  }
  const nova: Inscricao = { eventoId, nome, criadaEm: new Date().toISOString() }
  await writeFile(registros, JSON.stringify([...inscricoes, nova], null, 2))
  responder(resposta, 201, nova)
}

const atender = async (pedido: IncomingMessage, resposta: ServerResponse): Promise<void> => {
  const caminho: string = new URL(pedido.url ?? '/', 'http://localhost').pathname
  console.log(JSON.stringify({ evento: 'requisicao', metodo: pedido.method, caminho }))
  try {
    if (pedido.method === 'GET' && caminho === '/saude') {
      responder(resposta, 200, { status: 'ok', turma })
    } else if (pedido.method === 'GET' && caminho === '/eventos') {
      await listarEventos(resposta)
    } else if (pedido.method === 'GET' && caminho === '/inscricoes') {
      responder(resposta, 200, await lerInscricoes())
    } else if (pedido.method === 'POST' && caminho === '/inscricoes') {
      await inscrever(pedido, resposta)
    } else {
      responder(resposta, 404, { erro: 'Rota inexistente' })
    }
  } catch (erro: unknown) {
    const mensagem: string = erro instanceof Error ? erro.message : String(erro)
    console.error(JSON.stringify({ evento: 'falha', caminho, mensagem }))
    responder(resposta, 500, { erro: 'Falha interna. Consulte os logs da API.' })
  }
}

const servidor = createServer((pedido: IncomingMessage, resposta: ServerResponse): void => {
  void atender(pedido, resposta)
})

servidor.listen(porta, (): void => {
  console.log(JSON.stringify({ evento: 'inicio', porta }))
})
