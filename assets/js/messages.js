let messages = (function(){

    function displayMessage(type, message) {
        let modalMessages = document.getElementById('app-messages');
        modalMessages.classList.remove('hidden');

        if (type) {
            modalMessages.classList.remove('app-messages-error');
            modalMessages.classList.add('app-messages-sucess');
        } else {
            modalMessages.classList.remove('app-messages-sucess');
            modalMessages.classList.add('app-messages-error');
        }        

        modalMessages.innerHTML = message;

        setTimeout(() => modalMessages.classList.add('hidden'),2000);
    }

    return {
        displayMessage: displayMessage
    }

})();