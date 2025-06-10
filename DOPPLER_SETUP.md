# 🚀 Guia de Configuração de Ambiente com Doppler

Este documento explica como configurar as variáveis de ambiente para este projeto de forma segura usando o [Doppler](https://doppler.com).

O Doppler é um gerenciador de segredos que funciona como um "cofre" central para nossas chaves de API, evitando a necessidade de usar arquivos `.env` e garantindo que nossos segredos não sejam expostos no código-fonte.

---

## 1. Setup Inicial (Feito apenas uma vez por máquina)

### 1.1. Crie uma Conta no Doppler
- Se você ainda não tem uma conta, crie uma gratuitamente em [doppler.com](https://doppler.com).

### 1.2. Instale o Doppler CLI
A CLI (Interface de Linha de Comando) é a ferramenta que conecta sua máquina ao Doppler.

- **Windows (Instalação Manual):**
  1. Baixe o arquivo `doppler_windows_amd64.zip` da [página de lançamentos do Doppler no GitHub](https://github.com/DopplerHQ/cli/releases).
  2. Descompacte o arquivo. Você terá um executável `doppler.exe`.
  3. **Recomendado:** Mova o `doppler.exe` para uma pasta que esteja no `PATH` do seu sistema (como `C:\Windows\System32`) para poder usar o comando `doppler` de qualquer lugar. Se não fizer isso, você precisará executar os comandos usando o caminho completo para o executável (ex: `./doppler.exe`).

- **macOS (via Homebrew):**
  ```sh
  brew install dopplerhq/cli/doppler
  ```

- **Linux:**
  ```sh
  (curl -Ls https://cli.doppler.com/install.sh || wget -qO- https://cli.doppler.com/install.sh) | sudo sh
  ```

### 1.3. Faça o Login no Doppler
Abra seu terminal (PowerShell, CMD, etc.) e execute o comando:
```sh
doppler login
```
- Este comando irá abrir uma janela no seu navegador para você autorizar a conexão com a sua conta Doppler.
- Uma vez autorizado, seu terminal estará conectado ao seu cofre.

---

## 2. Configurando o Projeto (Feito uma vez por clone do projeto)

### 2.1. Navegue até a Pasta do Projeto
Pelo terminal, entre na pasta raiz deste projeto.

### 2.2. Conecte o Projeto ao Doppler
Execute o comando:
```sh
doppler setup
```
- O Doppler irá perguntar qual projeto e qual configuração (ambiente, ex: `dev`, `prd`) você deseja usar.
- Selecione o projeto e a configuração apropriados para este ambiente.

---

## 3. Rodando a Aplicação

Com o setup concluído, o arquivo `.env` não é mais necessário. Para rodar a aplicação, use o seguinte comando:

```sh
doppler run -- pnpm dev
```

**Como funciona?**
- `doppler run --` busca os segredos do cofre do Doppler e os injeta como variáveis de ambiente na sessão do terminal.
- `pnpm dev` é executado em seguida, e a aplicação (Vite) irá ler essas variáveis como se elas viessem de um arquivo `.env`.

---

## 4. Gerenciando Segredos

- **Para adicionar ou atualizar uma chave:** Faça a alteração diretamente no [Dashboard do Doppler](https://dashboard.doppler.com). As mudanças são aplicadas em tempo real para todos que usam o Doppler.
- **Para ver os segredos atuais no terminal:**
  ```sh
  doppler secrets
  ``` 