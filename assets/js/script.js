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
    const div_start_call = document.getElementById('j_div_start_call')
    const div_input_msg = document.getElementById('j_div_input_msg')
    const div_header_chat = document.getElementById('j_div_header_chat')
    const div_status_client = document.getElementById('j_div_status_client')
    //Variáveis do Perfil
    const perfil_img = document.querySelectorAll('.j_perfil_img')
    const perfil_name = document.querySelectorAll('.j_perfil_name')
    //Outras Variáveis
    const btn_send = document.getElementById('j_btn_send')
    const input_send = document.getElementById('j_input_send')
    const print_msg = document.getElementById('j_print_msg')
    const print_calls = document.getElementById('j_print_calls')
    const btn_start_call = document.getElementById('j_btn_start_call')
    //Variáveis de dados   
    var attendant = null
    var conn_ws = null
    var messages = null
    var item_call = []
    var data_calls = null
    var client = null
    var call = null
    //Crônometro
    var hour = 0
    var minute = 0
    var second = 0
    var millisecond = 0
    var cron
    const stopwatch_hour = document.getElementById('j_stopwatch_hour')
    const stopwatch_minute = document.getElementById('j_stopwatch_minute')
    const stopwatch_second = document.getElementById('j_stopwatch_second')
    const stopwatch_millisecond = document.getElementById('j_stopwatch_millisecond')
    //Comandos
    const cmd = {
        cmd_connection: cmdConnection,
        cmd_call_data_clients: cmdCallDataClients,
        cmd_call_history: cmdCallHistory,
        cmd_check_user_on: cmdCheckUserOn,
        cmd_call_msg: cmdCallMsg,
        cmd_call_start: cmdCallStart,
        cmd_token_expired: cmdTokenExpired,
        cmd_error: cmdError
    }

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

    //Passa UTC apara Hora e minutos local
    function formatTime(date) {
        let now
        let h

        if (date) {
            now = new Date(convertLocalDateToUTCDate(date));
            h = now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
        } else {
            now = new Date();
            h = now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
        }
        return h
    }

    //Adicionar mais scroll
    function addScroll() {
        print_msg.scrollTop += 500
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
        btn_start_call.onclick = () => startCall()
        btn_send.onclick = () => submitMsg()
        input_send.onkeypress = (e) => {
            if (e.key == 'Enter') {
                submitMsg()
                return false
            }
        }
    }

    //Converter UTC para data e hora local
    function convertLocalDateToUTCDate(date, toUTC) {
        date = new Date(date);
        //Hora local convertida para UTC     
        var localOffset = date.getTimezoneOffset() * 60000;
        var localTime = date.getTime();
        if (toUTC) {
            date = localTime + localOffset;
        } else {
            date = localTime - localOffset;
        }
        date = new Date(date);

        return date;
    }

    //Comando de token expirado
    function cmdTokenExpired(data) {       
        notifyPrimary("O seu acesso ao chat expirou, vamos renova-lo em 5 segundos")
        setTimeout(function () {
            document.location.reload()
        }, 5000)
    }

    //Comando de error
    function cmdError(data) {
        notifyError(data.msg)
    }

    //###############
    //  Cronômetro
    //###############

    //Start
    function stopwatchStart() {
        stopwatchPause()
        cron = setInterval(() => { stopwatchTimer(); }, 10)
    }

    //Pause
    function stopwatchPause() {
        clearInterval(cron)
    }

    //Reset
    function stopwatchReset() {
        hour = 0
        minute = 0
        second = 0
        millisecond = 0
        stopwatch_hour.innerText = '00'
        stopwatch_minute.innerText = '00'
        stopwatch_second.innerText = '00'
        stopwatch_millisecond.innerText = '000'
    }

    //Tempo
    function stopwatchTimer() {
        if ((millisecond += 10) == 1000) {
            millisecond = 0
            second++
        }
        if (second == 60) {
            second = 0
            minute++
        }
        if (minute == 60) {
            minute = 0
            hour++
        }
        stopwatch_hour.innerText = stopwatchReturnData(hour)
        stopwatch_minute.innerText = stopwatchReturnData(minute)
        stopwatch_second.innerText = stopwatchReturnData(second)
        stopwatch_millisecond.innerText = stopwatchReturnData(millisecond)
    }

    //Retorno
    function stopwatchReturnData(input) {
        return input > 10 ? input : `0${input}`
    }

    //Continuar contagem desde a ultima mensagem
    function stopwatchToBeContinue(date) {
        let before_obj
        let now_obj
        let diff
        let h
        let m
        let s

        stopwatchPause()
        stopwatchReset()

        if (date) {
            before_obj = new Date(convertLocalDateToUTCDate(date))
            now_obj = new Date()

            diff = Math.abs(now_obj.getTime() - before_obj.getTime());
            h = diff / (1000 * 60 * 60);
            m = (h - parseInt(h)) * 60;
            s = (m - parseInt(m)) * 60;

            hour = parseInt(h)
            minute = parseInt(m)
            second = parseInt(s)
            millisecond = 0

            stopwatchStart()
        }
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
                        initSocket(res.data.error.token)
                    } else {
                        changeState('conectar')
                        notifyError(res.data.error.msg)
                    }
                })
                .catch(function (err) {
                    changeState('conectar')
                    notifyOffline('Não foi possível gerar sua autentificação, erro na conexão com o servidor HTTP.')
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
                        swal.fire("Opss!!", res.data.error.msg, "error");
                    }
                })
                .catch(function (err) {
                    swal.fire("Opss!!", "Erro na conexão.", "error");
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
        return JSON.parse(sessionStorage.getItem("user"))
    }


    //###############
    //  WEBSOCKET
    //###############

    //Abrir conexão
    function initSocket(token) {

        conn_ws = new WebSocket(`${url_ws}/?t=${token}`);

        //Evento ao abrir conexão
        conn_ws.addEventListener('open', open => {
            changeState('chat')
            sendMessage({
                "cmd": "cmd_call_data_clients"
            })
        })

        //Evento ao enviar/receber mensagens
        conn_ws.addEventListener('message', message => {
            messages = JSON.parse(message.data)
            console.log(messages)

            if (messages.result) {
                cmd[messages.error.data.cmd](messages.error.data)
            } else {
                notifyPrimary(messages.error.msg)
            }
        })

        //Evento de error
        conn_ws.addEventListener('error', error => {
            notifyError(`Error na conexão com o servidor de chat!`)
            changeState('conectar')
        })

        //Evento ao fechar conexão
        conn_ws.addEventListener('close', close => {

            if (close.code == 1006) {
                changeState('conectar')
                notifyOffline(`O servidor de chat está offline!`)
            } else if (close.code == 1000) {
                changeState('logout')
                notifyInfo(`Conexão encerrada: ${messages.error.msg}`)
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
        sessionStorage.removeItem('call_in_progress')
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('token_chat')
        div_start_call.style.display = 'none'
        div_input_msg.style.display = 'none'
        headerChat()
        htmlInfoInitCall()
    }

    //Cmd conectado
    function cmdConnection() {
        let data = new Date();
        if (data.getHours() >= 12 && data.getHours() < 18) {
            notifyPrimary(`Boa tarde <b>${getUser().name}</b>, bom trabalho!`)
        } else if (data.getHours() >= 0 && data.getHours() < 12) {
            notifyPrimary(`Bom dia <b>${getUser().name}</b>, bom trabalho!`)
        } else {
            notifyPrimary(`Boa noite <b>${getUser().name}</b>, bom trabalho!`)
        }
    }


    //###############
    //  CALL
    //###############  

    //Obter os itens da lista de espera que estão listados na div pai
    function getPrintCall() {
        item_call = [...document.querySelectorAll('.j_item_call')]
    }

    //Ativar call selecionada
    function activeCall() {
        item_call.forEach((data) => { data.classList.remove('call-active') });
        this.classList.add('call-active');
        selectCall(this)
        sessionStorage.setItem('call_in_progress', this.dataset.call)
    }

    //Mensagem do cliente referente ao assunto da call
    function printCall(call, uuid, name, text, img, time, active = "", newmsg = false) {
        img = img ? img : "./assets/img/user.png"
        newmsg = newmsg ? 'block' : 'none'
        let html = `<a href="#" class="list-group-item d-flex gap-3 py-3 m-1 rounded shadow-sm j_item_call animate__animated animate__bounceInDown ${active}" data-call="${call}" data-uuid="${uuid}" aria-current="true">
                        <span class="position-absolute top-50 start-75 translate-middle p-1 bg-primary border border-white rounded-circle" style="display: ${newmsg}"></span>
                        <img src="${img}" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0 border border-2 border-white">                        
                        <div class="d-flex gap-2 w-100 justify-content-between position-relative">                            
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${time}</small>
                            <span class="position-absolute top-100 translate-middle badge rounded-pill bg-warning text-dark">#${call} </span>
                        </div>
                    </a>`
        print_calls.insertAdjacentHTML('beforeend', html)
    }

    //Consultar e atualizar listar de espera
    function cmdCallDataClients(calls) {
        let call_in_progress = sessionStorage.getItem('call_in_progress')
        let active
        print_calls.innerHTML = ''

        if (calls) {
            Object.values(calls.clients).forEach(function (data) {
                active = call_in_progress == data.call.call_id ? 'call-active' : ''
                if (data.call.call_attendant_uuid == attendant.uuid) { //listar call iniciadas pelo atendente
                    printCall(data.call.call_id, data.user.uuid, data.user.name, data.call.call_objective, data.user.avatar, formatTime(data.call.call_update), active)
                } else if (data.call.call_status == '1') { //listar call não iniciadas ainda
                    printCall(data.call.call_id, data.user.uuid, data.user.name, data.call.call_objective, data.user.avatar, formatTime(data.call.call_update), active)
                } else { //listar call iniciadas por outros atendentes
                    //será implementado posteriormente                   
                }
            });

            getPrintCall()
            item_call.forEach(function (data) {
                data.addEventListener('click', activeCall, false);
            })

            data_calls = calls.clients
        } else {
            data_calls = null
        }
    }

    //Texto informativo para selecionar uma call
    function htmlInfoInitCall() {
        let html = `<div class="card bg-dark gap-3 py-3 p-2 m-5 shadow-lg rounded animate__animated animate__shakeX animate__delay-2s">
                        <div class="card-body text-center">
                            <h2><i class="bi bi-arrow-left"></i> Clique em um cliente da lista.</h2>
                        </div>
                    </div>`
        let call_in_progress = sessionStorage.getItem('call_in_progress')

        //Verificar se alguma ja foi selecionada antes       
        if (call_in_progress) {
            selectCallInProgress(call_in_progress)
        } else {
            print_msg.innerHTML = ''
            print_msg.insertAdjacentHTML('beforeend', html)
        }
    }

    //Mostrar call já selecionada
    function selectCallInProgress(call_in_progress) {
        setTimeout(() => {
            let select_item = print_calls.querySelector(`[data-call="${call_in_progress}"]`)
            selectCall(select_item)
        }, 1500)
    }


    //###############
    //  CHAT
    //###############  

    //Povoar a mostrar cabeçalho do chat
    function headerChat(call_id) {
        if (call_id) {
            div_header_chat.style.display = 'block'
            div_header_chat.querySelector('img').src = client.avatar
            div_header_chat.querySelector('h6').innerText = `${client.name} ${client.lastname}`
            div_input_msg.dataset.call = call_id
        } else {
            div_header_chat.style.display = 'none'
            div_header_chat.querySelector('img').src = './assets/img/user.png'
            div_header_chat.querySelector('h6').innerText = 'Cliente'
            div_input_msg.dataset.call = ""
        }
    }

    //Selecionar call para troca de msg
    function selectCall(data) {

        let call_uuid = data.dataset.uuid
        let call_id = data.dataset.call
        call = data_calls[`call_${call_id}`].call
        client = data_calls[`call_${call_id}`].user
        print_msg.innerHTML = ''

        printMsgClient(client.name, call.call_objective, formatTime(call.call_update), client.avatar)

        sendMessage({
            "cmd": "cmd_call_history",
            "call": call_id,
            "limit": 500,
            "offset": 0
        })

        sendMessage({
            "cmd": "cmd_check_user_on",
            "check_on_uuid": call_uuid
        })
        headerChat(call_id)

        if (Number(call.call_status) == 1) {
            div_start_call.style.display = 'block'
            div_input_msg.style.display = 'none'
        } else {
            div_start_call.style.display = 'none'
            div_input_msg.style.display = 'flex'
        }
    }

    //Escreve msg do cliente
    function printMsgClient(name, text, time = false, img = false) {
        img = img ? img : "./assets/img/user.png"
        let html = ` <div class="list-group-item list-group-item d-flex gap-3 py-3 p-3 w-75 m-2 shadow msg-right animate__animated animate__fadeInDown">
                        <img src="${img}" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${time}</small>
                        </div>
                    </div>`
        print_msg.insertAdjacentHTML('beforeend', html)
        addScroll()
    }

    //Html da msg do atendente
    function printMsgAttendant(name, text, time) {
        let html = `<div class="list-group-item list-group-item d-flex gap-3 py-3 p-3 w-75 m-2 shadow align-self-end msg-left animate__animated animate__fadeInDown">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${time}</small>
                        </div>
                    </div>`
        print_msg.insertAdjacentHTML('beforeend', html)
        addScroll()
    }

    //Enviar mensagem
    function submitMsg() {

        if (input_send.value.trim().length > 0) {
            sendMessage({
                "cmd": "cmd_call_msg",
                "call": div_input_msg.dataset.call,
                "text": input_send.value
            })
            printMsgAttendant(attendant.name, input_send.value, formatTime())
            input_send.value = ""
            stopwatchReset()
            stopwatchStart()
            markNewMsg(div_input_msg.dataset.call, false)
        } else {
            notifyWarning("Mensagens vazias não podem ser enviadas!")
        }
    }

    //Print das mensagens recebidas
    function cmdCallMsg(data) {

        if (data.call == call.call_id) {
            printMsgClient(client.name, data.text, formatTime(data.date), client.avatar)
            markNewMsg(data.call, false)
        } else {
            markNewMsg(data.call, true)
        }
        stopwatchPause()
        stopwatchReset()
    }

    //Marcar e desmarcar novas mensagens
    function markNewMsg(id, newmsg = false) {
        newmsg = newmsg ? 'block' : 'none'
        document.querySelector(`.j_item_call[data-call="${id}"] span`).style.display = newmsg
    }

    //Iniciar call
    function startCall() {

        Swal.fire({
            title: 'Inicia este atendimento?',
            text: "Se iniciar este atendimento não será possível outro atendente iniciar!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, iniciar este!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                sendMessage({
                    "cmd": "cmd_call_start",
                    "call": div_input_msg.dataset.call
                })
            }
        })
    }

    //Comando iniciar call
    function cmdCallStart(data) {
        notifyPrimary("Atendimento iniciado, boa sorte!")
        div_input_msg.style.display = 'flex'
        div_start_call.style.display = 'none'
    }


    //###############
    //  HISTÓRICO
    //###############  

    //Listar mensagens anteriores da call
    function cmdCallHistory(data) {
        printHistory(data.chat)
    }

    //Listar histórico de mensagens
    function printHistory(msgs) {
        let date //UTC da ultima mensagem do cliente
        let stopwatch = false
        attendant = getUser()

        msgs.forEach(function (msg) {
            if (attendant.uuid == msg.origin) {
                stopwatch = true
                date = msg.date
                printMsgAttendant(attendant.name, msg.text, formatTime(msg.date))
            } else {
                stopwatch = false
                printMsgClient(client.name, msg.text, formatTime(msg.date), client.avatar)
            }
        });
        if (stopwatch) {
            if (date) {
                stopwatchToBeContinue(date)
            } else {
                stopwatchToBeContinue(call.call_update)
            }
        } else {
            stopwatchPause()
            stopwatchReset()
        }
    }


    //###############
    //  CLIENTE
    //###############  

    //Comando para mudar status do cliente
    function cmdCheckUserOn(data) {
        let online = `<b class="badge bg-success rounded-pill"><i class="bi bi-wifi"></i> Online</b>`
        let offline = `<b class="badge bg-danger rounded-pill"><i class="bi bi-wifi-off"></i> Offline</b>`
        let status = data.online ? online : offline
        div_status_client.innerHTML = status
    }


    //###############
    //  Conectar
    //###############   

    function toConnect() {
        if (checkExpToken()) {
            createToken()
        } else {
            initSocket(getToken())
            requestPerfil(getToken())
        }
    }


    //###############
    //  INICIAR
    //###############   

    function init() {
        let page = sessionStorage.getItem("page")

        if (page && page == 'chat') {
            if (conn_ws) {
                changeState(page)
                requestPerfil(getToken())
            } else {
                toConnect()
            }
        } else {
            changeState("logout")
        }
        htmlInfoInitCall()
        actionButtons()
    }

    init()
})()