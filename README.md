# Front-end para Chat de Atendimento
Front-end de um chat feito com com Bootstrap 5 para consumo da [API Chat de Atendimento](https://github.com/MardonioMelo/chat_api).

Set o uuid ou cpf do atendente na Session Storage nomeado como "identity"
>
    <!--Identificação-->
    <script>       
        sessionStorage.setItem("identity", JSON.stringify({
            "uuid": string, //UUID ou CPF
            "type": "attendant",
            "public": string
        }))
    </script>
>
