# Front-end para Chat de Atendimento
Front-end de um chat para consumo da [API Chat de Atendimento](https://github.com/MardonioMelo/chat_api).

Tecnologia utilizadas:
- HTML5
- JS
- CSS
- Bootstrap 5
- Axios
- Sweet Alert
- Animate


Para configurar a integração, renomeie o arquivo <code>exemple.main.js</code> para <code>main.js</code> e edite as informações do seu conteúdo. As informações do usuário podem ser passadas de forma dinâmica conforme seu aplicativo. Por exemplo, você pode implementar dentro desse arquivo uma busca no seu sistema para obter os dados a serem informados.

O único requisito é executar este script antes carregar o chat:
>     
    sessionStorage.setItem("identity", JSON.stringify({
        "uuid": string, //UUID ou CPF
        "type": "attendant",
        "public": string //chave pública
    }))  
>
