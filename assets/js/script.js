(function () {

    'use strict'

    //Setup
    const my_setup = getSetup()
    //Variáveis de rotas    
    const url_token = `${my_setup.host_http}/token`
    const url_perfil = `${my_setup.host_http}/attendant/perfil`
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
    var item_call = []
    var attendant_name = null
    var attendant_img = null
    var attendant_uuid = null
    var client_name = null
    var client_img = null
    var client_uuid = null


    /* global bootstrap: false */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })

    //Consultar setup
    function getSetup() {
        return JSON.parse(sessionStorage.getItem("my_setup"))
    }

    //Obter os itens de call
    function getPrintCall() {
        item_call = [...document.getElementsByClassName('j_item_call')]
    }

    //Set dados do atendente
    function setAttendant() {        

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
                    console.log(res.data.error)

                } else {
                    swal("Opss!!", res.data.error.msg, "error");
                }
            })
            .catch(function (err) {
                console.log(err)
                swal("Opss!!", "Erro na conexão.", "error");
            });

        attendant_name = "Juca 2"
        attendant_img = "https://avatars.githubusercontent.com/u/45853582?v=4"
        attendant_uuid = getDataToken().uuid
        attendant_img_src.src = attendant_img
    }

    //Set dados do cliente
    function setClient() {
        client_name = "Maria"
        client_img = "./assets/img/monkey.jpg"
        client_uuid = "uuidstring1"
        client_img_src.src = client_img
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
        printMsgAttendant(attendant_name, input_send.value)
        addScroll()
    }

    //Receber mensagem
    function receiveMsg() {
        printMsgClient(attendant_name, input_send.value, "")
        addScroll()
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

    //Listar histórico de mensagens
    function printHistory(msgs) {
        msgs.forEach(function (msg) {
            client_uuid == msg.origin ?
                printMsgClient(attendant_name, msg.text, client_img) :
                printMsgAttendant(attendant_name, msg.text, client_img)
        });
    }

    //Atualizar Listar fila de call
    function updateListCall() {
        if (calls.result) {
            Object.values(calls.error.data.clients).forEach(function (data) {
                printCall(data.call.call_id, data.user.uuid, data.user.name, data.call.call_objective, data.user.avatar, formatHora(data.call.call_update))
            });
            getPrintCall()
        } else {
            console.log(calls.error.msg)
        }
    }

    //Ativar call selecionada
    function activeCall() {
        item_call.forEach((data) => { data.classList.remove('call-active') });
        this.classList.add('call-active');
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

    //Tempo de expiração do token
    function getDataToken() {
        var [, base] = token.split(".")
        return JSON.parse(atob(base)).data
    }

    //Mudar status da página
    function changeState(a, b, c) {
        spin_load.style.display = a
        view_conectar.style.display = b
        view_chat.style.display = c
    }


    //###############
    //  INICIAR
    //###############   

    function init() {

        if (token == null || token == "" || getNowSeg() > getExpTime()) {
            createToken()
        } else {
            changeState('none', 'none', '')

            setAttendant()
            setClient()
            btn_send.addEventListener("click", receiveMsg)
            input_send.addEventListener("keypress", (e) => { e.key == 'Enter' ? sendMsg() : null })
            // printHistory(history)    
            //  updateListCall()

            item_call.forEach(function (data, index) {
                data.addEventListener('click', activeCall, false);
            })
        }


    }

    init()
})()
