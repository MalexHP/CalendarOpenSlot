/* 
  This file brings the main pieces ready to go.
*/

(function() {
   
    fetchUsers.getUsersSchedule(workWithUsersData);
    
    function workWithUsersData(data) {     
        usersAppointments.addAppointmentsToCalendar(data);
    }

})();

