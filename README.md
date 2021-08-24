# Front-end para Chat de Atendimento
Front-end de um chat para consumo da [API Chat de Atendimento](https://github.com/MardonioMelo/chat_api).

### Tecnologias:
- HTML5
- JS
- CSS3
- NodeJs
- NPM

### Dependências:
- Bootstrap 5.1
- Bootstrap Icons
- Axios
- SweetAlert2
- Animate
- Node-Snackbar

# Instalação
Execite o comando para instalar as dependências
>
    npm install
>

# Configuração

Para configurar a integração, renomeie o arquivo <code>exemple.main.js</code> para <code>main.js</code> e edite as informações do seu conteúdo. As informações do usuário podem ser passadas de forma dinâmica conforme seu aplicativo. Por exemplo, você pode implementar dentro desse arquivo uma busca no seu sistema para obter os dados a serem informados.

O único requisito é executar este script antes de carregar a pagina do chat:
>     
    sessionStorage.setItem("identity", JSON.stringify({
        "uuid": string, //UUID ou CPF
        "type": "attendant",
        "public": string //chave pública
    }))  
>

Lembre-se que os dados desse script devem ser informados dinamicamente conforme usuário logado em seu sistema.

<i><b>NOTA:</b> Por segurança, não recomenda-se salvar os dados do usuário de forma estática neste script.</i>
