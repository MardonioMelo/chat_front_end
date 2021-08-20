(function () {

    'use strict'

    //Setup
    const my_setup = getSetup()
    //Variáveis de rotas    
    const url_token = `${my_setup.host_http}/token`
    const url_perfil = `${my_setup.host_http}/attendant/perfil`
    const url_ws = `${my_setup.host_ws}`
    //Variáveis do DOM      
    const btn_send = document.getElementById('j_btn_send')
    const input_send = document.getElementById('j_input_send')
    const print_msg = document.getElementById('j_print_msg')
    const print_calls = document.getElementById('j_print_calls')
    const attendant_img_src = document.getElementById('j_attendant_img_src')
    const client_img_src = document.getElementById('j_client_img_src')
    const view_chat = document.getElementById('j_view_chat')
    const view_conectar = document.getElementById('j_view_conectar')
    const spin_load = document.getElementById('j_spin_load')

    //Variáveis de dados
    var token = getToken()
    var attendant = null
    var conn_ws = null
    var messages = null
    var item_call = []
    var client = null
    var calls = null

    /* global bootstrap: false */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })


    //###############
    //  GERAL
    //###############

    //Consultar setup
    function getSetup() {
        return JSON.parse(sessionStorage.getItem("my_setup"))
    }

    //Hora e minutos da mensagem
    function hora() {
        let now = new Date;
        return now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
    }

    //Adicionar mais scroll
    function addScroll() {
        print_msg.scrollTop += 500
    }

    //Formata data e hora para hora e minutos apenas
    function formatHora(v) {
        let now = new Date(v);
        return now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
    }


    //###############
    //  TOKEN
    //###############

    //Obter token
    function createToken() {

        let data = new FormData();
        data.append('uuid', my_setup.uuid);
        data.append('type', my_setup.type);
        data.append('public', my_setup.public);

        //Config request
        let config = {
            method: 'POST',
            url: url_token,
            headers: {
                'Content-Type': 'form-data',
                'Access-Control-Allow-Origin': '*'
            },
            data: data,
            mode: 'cors'
        }

        changeState('block', 'none', 'none')

        //Request
        axios(config)
            .then(function (res) {
                if (res.data.result) {
                    saveDataToken(res.data.error)
                    changeState('none', 'none', 'block')
                    location = location.href
                } else {
                    changeState('none', 'block', 'none')
                    swal("Opss!!", res.data.error.msg, "error");
                }
            })
            .catch(function (err) {
                changeState('none', 'block', 'none')
                swal("Opss!!", "Não foi possível gerar sua autentificação, verifique sua conexão.", "error");
            });
    }

    //Salvar token no session storage
    function saveDataToken(data) {
        if (data == null) {
            sessionStorage.setItem('token_chat', "");
        } else {
            sessionStorage.setItem('token_chat', data.token);
        }
    }

    //Recuperar token do session storage
    function getToken() {
        return sessionStorage.getItem('token_chat');
    }

    //Tempo atual em segundos
    function getNowSeg() {
        return parseInt(Date.now() / 1000)
    }

    //Tempo de expiração do token
    function getExpTime() {
        var [, base] = token.split(".")
        return JSON.parse(atob(base)).exp
    }

    //Mudar status da página
    function changeState(a, b, c) {
        spin_load.style.display = a
        view_conectar.style.display = b
        view_chat.style.display = c
    }


    //###############
    //  Perfil
    //###############

    //Set dados do atendente
    function setAttendant() {
        if (!attendant) {

            //Config request
            let config = {
                method: 'GET',
                url: url_perfil,
                headers: {
                    'Content-Type': 'none',
                    'Authorization': `Bearer ${token}`,
                    'Access-Control-Allow-Origin': '*'
                },
                mode: 'cors'
            }

            //Request
            axios(config)
                .then(function (res) {
                    if (res.data.result) {
                        attendant = res.data.error.data
                        attendant_img_src.src = attendant.avatar
                    } else {
                        swal("Opss!!", res.data.error.msg, "error");
                    }
                })
                .catch(function (err) {
                    swal("Opss!!", "Erro na conexão.", "error");
                });
        }
    }


    //###############
    //  WEBSOCKET
    //###############

    //Abrir conexão
    function initSocket() {

        //Informe o token na url
        conn_ws = new WebSocket(`${url_ws}/?t=${token}`);

        conn_ws.addEventListener('open', open => {
            console.log("Conexão aberta!")
        })

        conn_ws.addEventListener('message', message => {
            messages = JSON.parse(message.data)           

            if (messages.result) {
                swal("Sucesso", messages.error.msg, "success");
                console.log(messages.error)               
            } else {
                swal("Atenção", message.error.msg, "warning");
            }
        })

        conn_ws.addEventListener('error', error => {
            swal("Opss!!", "Error na conexão com o servidor!", "error");           
        })

        conn_ws.addEventListener('close', close => {
            if (close.code == 1006) {
                swal("Opss!!", "O servidor WS está offline!", "error");
            } else if (close.code == 1000) {
                swal("Atenção", "Conexão encerrada!", "info");                            
            }
        })       
    }    

    //Enviar msg
    function sendMessage(msg) {
        conn_ws.send(msg);
    }

    //Fechar conexão
    function closeConn() {
        conn_ws.close()
    }
    

    //###############
    //  CALL
    //###############  

    //Obter os itens da lista de espera que estão listados na div pai
    function getPrintCall() {
        item_call = [...document.getElementsByClassName('j_item_call')]
    }

    //Html da msg do cliente
    function printCall(call, uuid, name, text, img, time, online = false) {
        img = img ? img : "./assets/img/monkey.jpg"
        let html = `<a href="#" class="list-group-item d-flex gap-3 py-3 m-1 rounded shadow-sm j_item_call"
                        data-call="${call}" data-uuid="${uuid}"
                        aria-current="true">
                        <span
                            class="position-absolute top-50 start-75 translate-middle p-1 bg-${online ? 'success' : 'danger'} border border-light rounded-circle">
                        </span>
                        <img src="${img}" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${time}</small>
                        </div>
                    </a>`
        print_calls.insertAdjacentHTML('beforeend', html)
    }

    //Consultar e atualizar listar de espera
    function updateListCall() {

        if (calls) {
            Object.values(calls.error.data.clients).forEach(function (data) {
                printCall(data.call.call_id, data.user.uuid, data.user.name, data.call.call_objective, data.user.avatar, formatHora(data.call.call_update))
            });
            getPrintCall()
        } else {
            console.log(calls)
        }
    }


    //###############
    //  CHAT
    //###############  


    //Html da msg do cliente
    function printMsgClient(name, text, img = false) {
        img = img ? img : "./assets/img/monkey.jpg"
        let html = ` <div class="list-group-item list-group-item d-flex gap-3 py-3 p-3 w-75 m-2 shadow msg-right animate__animated animate__fadeInDown">
                        <img src="${img}" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${hora()}</small>
                        </div>
                    </div>`
        print_msg.insertAdjacentHTML('beforeend', html)
    }

    //Html da msg do atendente
    function printMsgAttendant(name, text) {
        let html = `<div class="list-group-item list-group-item d-flex gap-3 py-3 p-3 w-75 m-2 shadow align-self-end msg-left animate__animated animate__fadeInDown">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${hora()}</small>
                        </div>
                    </div>`
        print_msg.insertAdjacentHTML('beforeend', html)
    }

    //Enviar mensagem
    function sendMsg() {
        printMsgAttendant(attendant.name, input_send.value)
        addScroll()
    }

    //Receber mensagem
    function receiveMsg() {
        printMsgClient(attendant.name, input_send.value, "")
        addScroll()
    }

    //Ativar call selecionada
    function activeCall() {
        item_call.forEach((data) => { data.classList.remove('call-active') });
        this.classList.add('call-active');
    }


    //###############
    //  HISTÓRICO
    //###############  

    //Listar histórico de mensagens
    function printHistory(msgs) {
        msgs.forEach(function (msg) {
            client_uuid == msg.origin ?
                printMsgClient(attendant.name, msg.text, client_img) :
                printMsgAttendant(attendant.name, msg.text, client_img)
        });
    }


    //###############
    //  CLIENTE
    //###############  

    //Set dados do cliente
    function setClient() {
        if (!attendant) {

            //Config request
            let config = {
                method: 'GET',
                url: url_perfil,
                headers: {
                    'Content-Type': 'none',
                    'Authorization': token,
                    'Access-Control-Allow-Origin': '*'
                },
                mode: 'cors'
            }

            //Request
            axios(config)
                .then(function (res) {
                    if (res.data.result) {
                        attendant = res.data.error.data
                        attendant_img_src.src = attendant.avatar
                    } else {
                        swal("Opss!!", res.data.error.msg, "error");
                    }
                })
                .catch(function (err) {
                    console.log(err)
                    swal("Opss!!", "Erro na conexão.", "error");
                });
        }
    }


    //###############
    //  INICIAR
    //###############   

    function init() {

        if (token == null || token == "" || getNowSeg() > getExpTime()) {
            createToken()
        } else {
            changeState('none', 'none', '')
            initSocket()
            btn_send.addEventListener("click", receiveMsg)
            input_send.addEventListener("keypress", (e) => { e.key == 'Enter' ? sendMsg() : null })
            setAttendant()
            updateListCall()

            // printHistory(history)    


            item_call.forEach(function (data, index) {
                data.addEventListener('click', activeCall, false);
            })
        }
    }

    init()
})()
