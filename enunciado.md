# Docker com painel de tarefas

Turma A. Atividade individual de 30/09/2026. Entrega até o final do encontro de hoje.

Você executará o Nginx em um container, servirá um arquivo HTML do seu computador e alterará a porta de acesso. A página representa tarefas atribuídas a agentes coder e reviewer. O exercício trabalha a preparação do ambiente que poderá receber esses agentes em aulas futuras.

## Arquivos recebidos

Baixe e extraia o pacote da sua turma em uma pasta local. Preserve esta estrutura:

```text
turma-a/
  enunciado.md
  site/
    index.html
```

Use um editor de texto ou de código para alterar `site/index.html`. Salve o arquivo em UTF-8. Escolha uma pasta em que você tenha permissão de escrita e um caminho sem vírgulas. Caminhos com espaços são aceitos pelos comandos abaixo.

## 1. Conferir o Docker

No Windows e no macOS, abra o Docker Desktop e espere o serviço iniciar. No Windows, use containers Linux. No Linux, use o Docker já configurado no computador. Execute:

```text
docker info
```

A saída deve conter as seções `Client` e `Server`. Se aparecer erro de conexão com o daemon ou de permissão, registre a mensagem e avise o professor. A atividade exige acesso ao serviço Docker e à imagem `nginx:alpine`.

## 2. Personalizar a página

Substitua `SEU_NOME`, `SEU_RA` e `CODIGO_INFORMADO_EM_SALA` pelos seus dados e pelo código que o professor informar durante o encontro. No terceiro cartão, substitua "Tarefa escolhida" por uma tarefa de desenvolvimento que um agente poderia executar e descreva a entrega em uma frase. Troque "A definir" por "Pendente".

Abra o terminal na pasta `turma-a`, que contém a pasta `site`. Você pode abrir o terminal pelo gerenciador de arquivos ou usar `cd` com o caminho real da pasta extraída. Execute somente o bloco correspondente ao seu terminal.

### Windows com PowerShell

O comando `Resolve-Path` encontra o caminho absoluto da pasta. As aspas no argumento de montagem preservam espaços no caminho.

```powershell
$pastaSite = (Resolve-Path .\site).Path
docker run -d --name docker-a -p 127.0.0.1:8082:80 --mount "type=bind,source=$pastaSite,target=/usr/share/nginx/html,readonly" nginx:alpine
```

### Linux e macOS com Bash ou Zsh

```bash
pasta_site="$(pwd)/site"
docker run -d --name docker-a -p 127.0.0.1:8082:80 --mount "type=bind,source=$pasta_site,target=/usr/share/nginx/html,readonly" nginx:alpine
```

Os comandos montam a pasta `site` do computador em `/usr/share/nginx/html` dentro do container. O Nginx lê o HTML nesse diretório. A opção `readonly` permite leitura pelo container. Você edita o arquivo no computador. Consulte a [documentação de bind mounts](https://docs.docker.com/engine/storage/bind-mounts/).

Abra `http://localhost:8082` no navegador e confira nome, RA, código da aula e cartão personalizado. Capture a tela com a barra de endereço e esses dados visíveis. Salve como `01-porta-8082.png`.

## 3. Editar a página e trocar a porta

Troque o texto "Execução inicial" por "Execução revisada" e altere o estado do cartão Reviewer de "Pendente" para "Em revisão". Salve o arquivo e atualize o navegador. Confira que a alteração apareceu antes de trocar a porta.

Para alterar o mapeamento de portas, pare e remova somente o container desta atividade:

```text
docker stop docker-a
docker rm docker-a
```

Crie outro container com o mesmo nome, a mesma imagem e a mesma pasta montada. Use somente o bloco correspondente ao seu terminal. Mantenha o terminal na pasta `turma-a`.

### Windows com PowerShell

```powershell
$pastaSite = (Resolve-Path .\site).Path
docker run -d --name docker-a -p 127.0.0.1:8092:80 --mount "type=bind,source=$pastaSite,target=/usr/share/nginx/html,readonly" nginx:alpine
```

### Linux e macOS com Bash ou Zsh

```bash
pasta_site="$(pwd)/site"
docker run -d --name docker-a -p 127.0.0.1:8092:80 --mount "type=bind,source=$pasta_site,target=/usr/share/nginx/html,readonly" nginx:alpine
```

Abra `http://localhost:8092`. Capture a tela com a nova barra de endereço, a alteração da página, seu RA e o código da aula visíveis. Salve como `02-porta-8092.png`.

O acesso ao Nginx ocorre pela porta 8092 do computador, publicada na interface local, e chega à porta 80 do container. Consulte a [documentação de publicação de portas](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/).

## 4. Parar e conferir o estado

Execute:

```text
docker stop docker-a
docker inspect --format '{{.State.Status}}' docker-a
docker ps -a --filter name=docker-a
```

O comando `inspect` deve retornar `exited`. A listagem deve incluir `docker-a` parado. Copie os comandos e a saída para a entrega. Mantenha esse container até registrar as evidências. Depois da entrega, você pode removê-lo com `docker rm docker-a`.

## 5. Entregar pelo formulário

Acesse o link entregue pelo professor. O formulário desta atividade registra sua identificação e sua entrega. O formulário de feedback sobre as aulas tem outra finalidade e outra entrega.

Informe nome, RA, turma A e código da aula. Envie o link para uma pasta no Drive com acesso de leitura concedido ao professor ou para um repositório que ele consiga acessar. Inclua:

- `site/index.html` com a versão final.
- `01-porta-8082.png` e `02-porta-8092.png`.
- `comandos.txt` com os comandos executados, o resultado de `inspect` e a listagem final do container parado.

Confira as permissões do link antes de enviar. Em repositório público, restrinja as evidências aos dados pedidos nesta atividade. Se preferir manter seus dados privados, compartilhe a pasta ou o repositório diretamente com o professor.

Responda no formulário, em uma ou duas frases por questão:

1. Qual imagem você usou e qual container criou? Explique a diferença entre imagem e container neste exercício.
2. Informe os dois mapeamentos de portas usados, com 8082 e 8092. Explique qual porta pertence ao computador e qual pertence ao container. Qual endereço você abriu no navegador ao final?
3. Como a alteração de `site/index.html` ficou disponível para o Nginx? Explique o papel do bind mount e por que o HTML continuou disponível após recriar o container.

A entrega é individual. Você pode consultar o [material de Docker apresentado em aula](https://github.com/TI-UNICESUMAR/2024-topicos-especiais-ads5s/tree/main/2024-06-05-docker), a documentação e ferramentas de IA. Confira os comandos e os resultados antes de entregar.

## Se ocorrer um problema

- `bind source path does not exist` indica um caminho que o Docker não encontrou. Confira se o terminal está na pasta `turma-a` e se `site/index.html` existe.
- Uma página padrão do Nginx ou um erro 403 pede conferência da montagem e do nome `index.html`. Verifique também se o editor salvou o arquivo e atualize o navegador.
- `port is already allocated` indica que a porta está ocupada. Avise o professor para receber outra porta e registre a mudança na entrega.
- `container name is already in use` indica um container com esse nome. Confira `docker ps -a --filter name=docker-a` e remova somente o seu container da atividade, depois de registrar o que for necessário.
- Problemas de rede, instalação ou permissão devem ser informados durante o encontro. Envie no formulário o que conseguiu executar e a mensagem de erro. O professor orientará a forma de conclusão.

## Formulário de entrega

[Enviar respostas e evidências](https://docs.google.com/forms/d/e/1FAIpQLSeDnDzuUopZnNLYIEcIBlg7iKI1Q_rp6nv1qBHhd7zEyJt8Tw/viewform). Preencha até o fim do encontro de 30/09.
