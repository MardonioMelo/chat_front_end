(function () {

    'use strict'

    /* global bootstrap: false */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })

    //Constantes
    const token = ""
    const btn_send = document.getElementById('j_btn_send')
    const input_send = document.getElementById('j_input_send')
    const print_msg = document.getElementById('j_print_msg')
    const print_calls = document.getElementById('j_print_calls')
    const attendant_img_src = document.getElementById('j_attendant_img_src')
    const client_img_src = document.getElementById('j_client_img_src')
    var attendant_name = ""
    var attendant_img = ""
    var attendant_uuid = ""
    var client_name = ""
    var client_img = ""
    var client_uuid = ""
    var history = [
        {
            "id": 1,
            "call": 2,
            "origin": "uuidstring1", //uuid do user de origem
            "destiny": "uuistring2", //uuid do user de destino
            "text": "Olá!", //mensagem
            "type": "typestring", //text
            "date": "17/08/2021 10:21",//data e hora
            "url": "httpstring" //url do registro
        },
        {
            "id": 2,
            "call": 2,
            "origin": "uuistring2", //uuid do user de origem
            "destiny": "uuidstring1", //uuid do user de destino
            "text": "Tudo bem?", //mensagem
            "type": "typestring", //text
            "date": "17/08/2021 10:21",//data e hora
            "url": "httpstring" //url do registro
        }
    ]
    var call_data_clients = [  //dados dos clientes em espera
        { //00 - corresponde ao id da call.
            "user": { //dados do cliente
                "id": 1, //id do cliente
                "cpf": 1234556,
                "uuid": "string",
                "name": "string",
                "lastname": "string",
                "avatar": "",
                "updated_at": "string",
                "created_at": "string",
                "url": "string"
            },
            "call": { //dados da call
                "call_id": 2,
                "call_client_uuid": "string",
                "call_attendant_uuid": "string",
                "call_objective": "string",
                "call_status": 1,
                "call_start": "string",
                "call_end": "string",
                "call_evaluation": null,
                "call_update": "string"
            }
        },
        { //00 - corresponde ao id da call.
            "user": { //dados do cliente
                "id": 1, //id do cliente
                "cpf": 1234556,
                "uuid": "string",
                "name": "string",
                "lastname": "string",
                "avatar": "",
                "updated_at": "string",
                "created_at": "string",
                "url": "string"
            },
            "call": { //dados da call
                "call_id": 3,
                "call_client_uuid": "string",
                "call_attendant_uuid": "string",
                "call_objective": "string",
                "call_status": 1,
                "call_start": "string",
                "call_end": "string",
                "call_evaluation": null,
                "call_update": "string"
            }
        }
    ]


    function setToken() {

    }

    function getToken() {

    }

    //Set dados do cliente
    function setClient() {
        client_name = "Maria"
        client_img = "./img/monkey.jpg"
        client_uuid = "uuidstring1"

        client_img_src.src = client_img
    }

    //Set dados do atendente
    function setAttendant() {
        attendant_name = "Juca 2"
        attendant_img = "https://avatars.githubusercontent.com/u/45853582?v=4"
        attendant_uuid = "uuistring2"

        attendant_img_src.src = attendant_img
    }

    //Html da msg do cliente
    function printCall(call, uuid, name, text, img, time) {
        img = img ? img : "./img/monkey.jpg"
        let html = `<a href="#" class="list-group-item list-group-item-action d-flex gap-3 py-3 position-relative"
                        data-call="${call}" data-uuid="${uuid}"
                        aria-current="true">
                        <span
                            class="position-absolute top-50 start-75 translate-middle p-1 bg-success border border-light rounded-circle">
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
        img = img ? img : "./img/monkey.jpg"
        let html = ` <a class="list-group-item list-group-item-action d-flex gap-3 py-3 p-3 w-75 m-2 msg-right shadow">
                        <img src="${img}" alt="twbs" width="32" height="32" class="rounded-circle flex-shrink-0">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${hora()}</small>
                        </div>
                    </a>`
        print_msg.insertAdjacentHTML('beforeend', html)
    }

    //Html da msg do atendente
    function printMsgAttendant(name, text) {
        let html = `<a class="list-group-item list-group-item-action d-flex gap-3 py-3 p-3 w-75 m-2 align-self-end msg-left shadow">
                        <div class="d-flex gap-2 w-100 justify-content-between">
                            <div>
                                <h6 class="mb-0 fw-bold">${name}</h6>
                                <p class="mb-0 opacity-75">${text}</p>
                            </div>
                            <small class="opacity-50 text-nowrap">${hora()}</small>
                        </div>
                    </a>`
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

    //Listar fila de espera
    function printListCall(calls) {
        calls.forEach(function (data) {
            printCall(data.call.call_id, data.user.uuid, data.user.name, data.call.call_objective, data.user.avatar, data.call.call_update)
        });
    }

    //Init
    function init() {
        setAttendant()
        setClient()
        btn_send.addEventListener("click", receiveMsg)
        input_send.addEventListener("keypress", (e) => {
            e.key == 'Enter' ? sendMsg() : null
        })
        printHistory(history)
        printListCall(call_data_clients)
    }

    init()
})()
