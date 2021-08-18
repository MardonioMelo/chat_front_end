(function () {

    'use strict'

    /* global bootstrap: false */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })

    //Constantes
    const btn_send = document.getElementById('j_btn_send')
    const input_send = document.getElementById('j_input_send')
    const print_msg = document.getElementById('j_print_msg')
    const attendant_name = "Juca";
    const attendant_img = "";
    const client_name = "Maria";
    const client_img = "";


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
        print_msg.append(html)
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
        printMsgAttendant(attendant_name, input_send.value,)
    }

    //Hora e minutos da mensagem
    function hora() {
        let now = new Date;
        return now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
    }

    //Init
    function init() {
        btn_send.addEventListener("click", sendMsg)
        input_send.addEventListener("keypress", (e) => {
            e.key == 'Enter' ? sendMsg() : null
        })
    }

    init()
})()
