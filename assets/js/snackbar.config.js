(function () {

    notifyOffline = (msg) => {
      new Snackbar.show({
            text: `<i class="bi bi-wifi-off" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'top-left',         
            customClass: "rounded border-5 border-danger border-start animate__animated animate__swing",        
            actionText: `<i class="bi bi-x-lg"></i>`,
            duration: 10000   
        });
    }

    notifyError = (msg) => {
      new  Snackbar.show({
            text: `<i class="bi bi-emoji-frown" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'top-left',         
            customClass: "rounded border-5 border-danger border-start",        
            actionText: `<i class="bi bi-x-lg"></i>`,
            duration: 10000   
        });
    }  

    notifyInfo = (msg) => {
        Snackbar.show({
            text: `<i class="bi bi-emoji-sunglasses" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'bottom-left',         
            customClass: "rounded border-5 border-info border-start",        
            actionText: `<i class="bi bi-x-lg"></i>`,
            duration: 6000   
        });
    }

    notifySuccess = (msg) => {
        Snackbar.show({
            text: `<i class="bi bi-emoji-heart-eyes" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'bottom-left',         
            customClass: "rounded border-5 border-success border-start",        
            actionText: `<i class="bi bi-x-lg"></i>`,
            duration: 5000   
        });
    }

    notifyWarning = (msg) => {
        Snackbar.show({
            text: `<i class="bi bi-emoji-neutral" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'bottom-left',         
            customClass: "rounded border-5 border-warning border-start",        
            actionText: `<i class="bi bi-x-lg"></i>`, 
            duration: 6000
        });
    }

    notifyPrimary = (msg) => {
        Snackbar.show({
            text: `<i class="bi bi-emoji-smile" style="font-size: 1rem;"></i> ${msg}`,
            pos: 'bottom-left',         
            customClass: "rounded border-5 border-primary border-start",        
            actionText: `<i class="bi bi-x-lg"></i>`,
            duration: 6000
        });
    }
})()
