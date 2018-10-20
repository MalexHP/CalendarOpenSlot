(function() {
   
    fetchUsers.getUsersSchedule(workWithUsersData);
    
    function workWithUsersData(data) {     
        usersAppointments.addAppointmentsToCalendar(data);
        findOpenSlot.matchAvailability(null,data)
    }

})();

