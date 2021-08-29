# Front-end para Chat de Atendimento 
Front-end de um chat para consumo da [API Chat de Atendimento](https://github.com/MardonioMelo/chat_api).


# Instalação
Clone/baixe este repositório na sua aplicação/sistema e crie um link para acesso a esta pasta.

Execute este comando dentro da pasta para instalar as dependências:
>
    npm install
>

# Configuração

## Base URL/URI

Defina a base URL/URI, ou sejá, a URL até a pasta desse projeto localizada no seu sistema.

Por exemplo se o seu sistema for em PHP:
- Crie um arquivo php onde o chat do atendente deve ser carregado
- Neste arquivo inclua a tag HTML `<base>` e no href dela informe o caminho URL relativo até a pasta desse projeto.
- Importe o arquivo index.html desse projeto apos a tag HTML `<base>`

Ficaria assim o conteúdo do arquivo index.php:
>
    <base href="http://localhost/chat_front_end/">
    <?php
    include "./chat_front_end/index.html";
>


## Integração

Para configurar a integração, renomeie o arquivo <code>exemple.main.js</code> para <code>main.js</code> e edite as informações do seu conteúdo. As informações do usuário podem ser passadas de forma dinâmica conforme seu aplicativo. Por exemplo, você pode implementar dentro desse arquivo uma busca no seu sistema para obter os dados a serem informados.

O único requisito é executar este script antes de carregar a pagina do chat:
>     
    sessionStorage.setItem("identity", JSON.stringify({
        "uuid": string, //UUID ou CPF
        "type": "attendant",
        "public": string, //chave pública
        "host_http": string,
        "host_ws": string
    }))   
>

Lembre-se que os dados desse script devem ser informados dinamicamente conforme usuário logado em seu sistema.

<i><b>NOTA:</b> Por segurança, não recomenda-se salvar os dados do usuário de forma estática neste script.</i>


# Tecnologias:
- HTML5
- JS
- CSS3
- NodeJs
- NPM

# Dependências:
- Bootstrap 5.1
- Bootstrap Icons
- Axios
- SweetAlert2
- Animate
- Node-Snackbar