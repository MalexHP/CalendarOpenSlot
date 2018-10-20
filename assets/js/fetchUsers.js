let fetchUsers = (function(){
    
    //Service sends the appointments array in ascendent order
    //An use can not have overlapped appointments

    let endpoints = {
        getUsersAppointments: 'assets/js/dummy-data.json'
    }

    let getUsersSchedule = (callback) => {
        let url = endpoints.getUsersAppointments;
        $.get(url)
            .done((data) => {
                if (data.success) {
                    callback(data);
                } else {
                    messages.displayMessage(false, "Something went wrong");
                }
            }).fail((err) => {
                callback(err);
            });
    };
    

    return {
        getUsersSchedule: getUsersSchedule
    }
})();