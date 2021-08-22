(function () {

    'use strict'

    //Setup
    const my_setup = getSetup()
    //Variáveis de rotas    
    const url_token = `${my_setup.host_http}/token`
    const url_perfil = `${my_setup.host_http}/attendant/perfil`
    const url_ws = `${my_setup.host_ws}`
    //Variáveis do DOM   
    const view_chat = document.getElementById('j_view_chat')
    const view_conectar = document.getElementById('j_view_conectar')
    const spin_load = document.getElementById('j_spin_load')
    const view_logout = document.getElementById('j_logout')
    const btn_login = document.getElementById('j_btn_login')
    const btn_conectar = document.getElementById('j_btn_conectar')
    const btn_logout = document.getElementById('j_btn_logout')
    //Variáveis do Perfil
    const perfil_img = document.querySelectorAll('.j_perfil_img')
    const perfil_name = document.querySelectorAll('.j_perfil_name')
    //Outras Variáveis
    const btn_send = document.getElementById('j_btn_send')
    const input_send = document.getElementById('j_input_send')
    const print_msg = document.getElementById('j_print_msg')
    const print_calls = document.getElementById('j_print_calls')
    const client_img_src = document.getElementById('j_client_img_src')

    //Variáveis de dados   
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

    //Roteamento e troca de estado da página
    function changeState(page) {
        switch (page) {
            case 'load':
                spin_load.style.display = 'block'
                view_conectar.style.display = 'none'
                view_chat.style.display = 'none'
                view_logout.style.display = 'none'
                sessionStorage.setItem("page", "load")
                break;
            case 'conectar':
                spin_load.style.display = 'none'
                view_conectar.style.display = 'block'
                view_chat.style.display = 'none'
                view_logout.style.display = 'none'
                sessionStorage.setItem("page", "conectar")
                break;
            case 'chat':
                spin_load.style.display = 'none'
                view_conectar.style.display = 'none'
                view_chat.style.display = 'flex'
                view_logout.style.display = 'none'
                sessionStorage.setItem("page", "chat")
                break;
            case 'logout':
                spin_load.style.display = 'none'
                view_conectar.style.display = 'none'
                view_chat.style.display = 'none'
                view_logout.style.display = 'block'
                sessionStorage.setItem("page", "logout")
                break;

            default:
                break;
        }
    }

    //Botões de ação
    function actionButtons() {

        item_call.forEach(function (data) {
            data.addEventListener('click', activeCall, false);
        })

        btn_login.onclick = () => {
            changeState('load')
            toConnect()
        }

        btn_conectar.onclick = () => {
            changeState('load')
            toConnect()
        }

        btn_logout.onclick = () => {
            changeState('logout')
            closeConn()
        }

        btn_send.onclick = () => receiveMsg
        input_send.onkeypress = (e) => { e.key == 'Enter' ? sendMsg() : null }
    }


    //###############
    //  TOKEN
    //###############

    //Obter token
    function createToken() {

        if (checkExpToken()) {

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

            //Request
            axios(config)
                .then(function (res) {
                    if (res.data.result) {
                        saveDataToken(res.data.error)
                        requestPerfil(res.data.error.token)
                        changeState('chat')
                    } else {
                        changeState('conectar')
                        swal("Opss!!", res.data.error.msg, "error");
                    }
                })
                .catch(function (err) {
                    changeState('conectar')
                    swal("Opss!!", "Não foi possível gerar sua autentificação, verifique sua conexão.", "error");
                });
        } else {
            changeState('chat')
            requestPerfil(getToken())
        }
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

    //verificar se o token expirou - true = vencido
    function checkExpToken() {
        let res = true

        if (getToken()) {
            let now_seg = parseInt(Date.now() / 1000)
            let [, base] = (getToken()).split(".")
            let exp = JSON.parse(atob(base)).exp
            res = now_seg > exp ? true : false
        }
        return res
    }


    //###############
    //  Perfil
    //###############

    //Set dados do user
    function requestPerfil(token) {
        if (token) {

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
                        setUser(res.data.error.data)
                    } else {
                        swal("Opss!!", res.data.error.msg, "error");
                    }
                })
                .catch(function (err) {
                    swal("Opss!!", "Erro na conexão.", "error");
                });
        }
    }

    //Incluir dados do user na sessão
    function setUser(data) {
        sessionStorage.setItem("user", JSON.stringify(data))
        attendant = data

        perfil_img.forEach(function (data) {
            data.src = attendant.avatar
        })

        perfil_name.forEach(function (data) {
            data.innerHTML = attendant.name
        })
    }

    //Obter dados do user da sessão
    function getUser(data) {
        return JSON.parse(sessionStorage.setItem("user"))
    }


    //###############
    //  WEBSOCKET
    //###############

    //Abrir conexão
    function initSocket() {

        conn_ws = new WebSocket(`${url_ws}/?t=${getToken()}`);

        //Evento ao abrir conexão
        conn_ws.addEventListener('open', open => {
            changeState('chat')
        })

        //Evento ao enviar/receber mensagens
        conn_ws.addEventListener('message', message => {
            messages = JSON.parse(message.data)

            if (messages.result) {
                console.log(messages.error)
            } else {
                swal("Atenção", messages.error.msg, "warning");
            }
        })

        //Evento de error
        conn_ws.addEventListener('error', error => {
            swal("Opss!!", "Error na conexão com o servidor de chat!", "error");
            changeState('conectar')
        })

        //Evento ao fechar conexão
        conn_ws.addEventListener('close', close => {
            if (close.code == 1006) {
                changeState('conectar')
                swal("Opss!!", "O servidor de chat está offline!", "error");
            } else if (close.code == 1000) {
                changeState('logout')
                swal("Atenção", `Conexão encerrada: ${messages.error.msg}`, "info");
            }
        })
    }

    //Enviar msg
    function sendMessage(msg) {
        conn_ws.send(JSON.stringify(msg));
    }

    //Fechar conexão
    function closeConn() {
        if (conn_ws) {
            conn_ws.close()
        }
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
    //  Conectar
    //###############   

    function toConnect() {
        if (checkExpToken()) {
            createToken()
        } else {
            initSocket()
            // updateListCall()
            // printHistory(history)             
        }
    }


    //###############
    //  INICIAR
    //###############   

    function init() {

        let page = sessionStorage.getItem("page")
        if (page) {
            changeState(page)
            requestPerfil(getToken())
        } else {
            changeState("logout")
        }

        actionButtons()

        console.log(attendant)
    }

    init()
})()
