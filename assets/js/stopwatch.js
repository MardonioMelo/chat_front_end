(function () {

    "use strict";

    //Script para montar um cronômetro

    let hour = 0;
    let minute = 0;
    let second = 0;
    let millisecond = 0;

    let cron;

    document.getElementById('j_snackbar_start').onclick = () => snackbar_start();
    document.getElementById('j_snackbar_pause').onclick = () => snackbar_pause();
    document.getElementById('j_snackbar_reset').onclick = () => snackbar_reset();

    var snackbar_start = () => {
        snackbar_pause();
        cron = setInterval(() => { timer(); }, 10);
    }

    var snackbar_pause = () => {
        clearInterval(cron);
    }

    var snackbar_reset = () => {
        hour = 0;
        minute = 0;
        second = 0;
        millisecond = 0;
        document.getElementById('snackbar_hour').innerText = '00';
        document.getElementById('snackbar_minute').innerText = '00';
        document.getElementById('snackbar_second').innerText = '00';
        document.getElementById('snackbar_millisecond').innerText = '000';
    }

    function timer() {
        if ((millisecond += 10) == 1000) {
            millisecond = 0;
            second++;
        }
        if (second == 60) {
            second = 0;
            minute++;
        }
        if (minute == 60) {
            minute = 0;
            hour++;
        }
        document.getElementById('snackbar_hour').innerText = returnData(hour);
        document.getElementById('snackbar_minute').innerText = returnData(minute);
        document.getElementById('snackbar_second').innerText = returnData(second);
        document.getElementById('snackbar_millisecond').innerText = returnData(millisecond);
    }

    function returnData(input) {
        return input > 10 ? input : `0${input}`
    }

})()