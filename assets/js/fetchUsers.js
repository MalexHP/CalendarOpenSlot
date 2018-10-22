/*
  This files simulates the data fetch
 
  The Service Definition (Dummy data definition) is as follows:
  1- Each record has the following key value pairs:
     * User Id : This can be used for CRUD iperations
     * User name
     * Appointments: This is an array of all the booked appointments the user has, each element has the following key value pairs:
       ** subject: Is the title of the appointment
       ** day: This is the day where the appointment has been booked
       ** start: This is the starting time for the appointment, format 24 hrs hh:mm
       ** end: This is the end time for the appointment, format 24 hrs hh:mm
   2.- The appointments comes in ascending order
   3.- A user can has several appointments in the same day, as long as the appointments do not overlap each other.

   The scenarios that were tested was:

   * When N users has just one appointment on a day.
   * When N users has more than one appointment on a day, but in different time range,
     because for one user that has two appointments that overlaps in some time is paradoxical.

    ================= The day with test cases is 8 =======================

*/

let fetchUsers = (function(){
    let endpoints = {
        getUsersAppointments: 'assets/js/dummy-data.json'
    }

    let getUsersSchedule = (callbackFunc) => {
        let url = endpoints.getUsersAppointments;
        $.get(url)
            .done((data) => {
                if (data.success) {
                    callbackFunc(data);
                } else {
                    messages.displayMessage(false, "Something went wrong");
                }
            }).fail((err) => {
                callbackFunc(err);
            });
    };
    

    return {
        getUsersSchedule: getUsersSchedule
    }

})();