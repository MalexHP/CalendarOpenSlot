/*

   This file handle all the UI.

   The names of variables and functions try to be semantic and self explanatory

   1.- Using the user's data, the script will add a red calendar icon in all the days that has one or more appointments booked, 
   it does not matter who is the user or users.
   
   2.- All the js events needed are added here.

   3.- It will receive an array, after a query, from findOpenSlot.js. The information will be render in the UI accordingly.


*/


let usersAppointments = (function() {
    
    function addAppointmentsToCalendar(resp) {
        let localData = JSON.parse(JSON.stringify(resp.data));

        let getUsersBookedDays = (() => { 
            //In this a function expression, just to avoid doing getUsersBookedDays().length, instead of getUsersBookedDays.length
            //The hoist property of functions declarations was not needed
            let usersWithAppointments = localData.filter( user => user.appointments.length !== 0);
            let getDaysBooked = usersWithAppointments.map( person => getDays(person.appointments) ).join();
            let bookedDays = arrangeArrays(getDaysBooked);
            return bookedDays;

            //HELP FUNCTIONS

            // In one day a user might have more than one appointment
            function arrangeArrays(arr) { 
                let sortDays = arr.split(',').sort( (a,b) => a-b );
                let eliminateDuplicates = [];
                for (let i=0; i < sortDays.length; i++) {
                    if (eliminateDuplicates.indexOf(sortDays[i]) === -1) {
                        eliminateDuplicates.push(sortDays[i]);
                    }
                }
                return eliminateDuplicates;
            }//End getUsersBookedDays() > arrangeArrays()  

            function getDays(appointments) {
                return appointments.map( days => days.day ).join();
            }//End getDays() > arrangeArrays()

        })();//End addAppointmentsToCalendar() > getUsersBookedDays

        matchUserDaysWithCalendar(); //This function does most of the work described at the top

        function matchUserDaysWithCalendar() {
            let getNodeDays = document.getElementsByClassName('date');            

            for (let i=0; i < getUsersBookedDays.length; i++) {

                let dayNode = getNodeDays.namedItem('date-' + getUsersBookedDays[i]).parentElement;

                if (dayNode) {
                    createImageIconBooked(dayNode);
                }              
            }

            for (let i=0; i < getNodeDays.length; i++) {    

                if (getNodeDays[i].parentElement.className.includes('tooltip')) { 

                    let dayNode = getNodeDays[i].parentElement;   

                    if (dayNode.querySelectorAll('.booked-icon').length) { 
                        tooltipToBookAndBtnEvents(true, dayNode, i);
                    } else {                        
                        tooltipToBookAndBtnEvents(false, dayNode, i);
                    } 
                } 
            }

            //HELP FUNCTIONS
            function createImageIconBooked(node) {
                var imgs = document.createElement('IMG');
                imgs.setAttribute('src', 'assets/images/icons/calendar-and-clock.svg');
                imgs.setAttribute('class','booked-icon');
                imgs.setAttribute('alt', 'Booked');
                node.appendChild(imgs);
            }//End matchUserDaysWithCalendar() > createImageIconBooked()

            function tooltipToBookAndBtnEvents(type, dayNode, i){
                //Type true, check for availability
                //Type false, all the users are available
                if (type) {    
                    let formCheckAvailabilty = `
                          <form class='js-availability-form'>
                             <label for='duration-${i}'>Appointment Duration</label>
                             <input id='duration-${i}' type='number'>
                             <select id='partOfTheDay-${i}>
                                <option val='mins'>mins</option>
                                <option val='mins'>hrs</option>
                             </select>
                             <button id='js-find-availability-${i}' class='book-appointment' type='button'>Find availability</button>
                          </form>       
                    `;

                    dayNode.querySelector('h2').innerHTML = 'Check for Availabilty';
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = formCheckAvailabilty;

                    document.getElementById(`js-find-availability-${i}`).addEventListener('click', (e) => {
                        //Will handle the response of the query sent by findOpenSlot.js
                        //Some basic validations are applied for inputs and also some basic UI transformations inside the tooltip
                        let durationTime = document.getElementById(`duration-${i}`);
                        let partOfTheDayTime = document.getElementById(`partOfTheDay-${i}`);
                       
                        if (durationTime.value.trim().length) {
                            let availabilityDates = [
                                  {'dates': 
                                      [{'ini':'14:10','end':'15:16'},{'ini':'17:18','end':'21:50'}]
                                  },
                                  {'usersAvailable':4}
                            ];//findOpenSlot.matchAvailability(e,localData);
                            let btnBook = setValuesForBookAppointment();                        
                            if (availabilityDates.length) {
                                dayNode.querySelector('h2').innerHTML = 'The team is available';
                                dayNode.querySelector('h2').style.color = 'green';
                                dayNode.querySelector('.js-availability-form').parentElement.innerHTML = btnBook;
                            } else {
                                messages.displayMessage(false,'Sorry, the team is not available');
                            }
                        } else {
                            messages.displayMessage(false,'Please set a Duration');
                        }    
                    });
                } else {   
                    let bookAppointment = `
                          <input type='time' id='setTime-ini-${i}' class='set-time' name='appt-time' min='1:00' max='24:00' required />
                          <span> to </span>
                          <input type='time' id='setTime-end-${i}' class='set-time' name='appt-time' min='1:00' max='24:00' required />
                          <button id='js-book-appointment-${i}' class='book-appointment' type='button'>Book Appointment</button>                          
                    `;

                    dayNode.querySelector('h2').innerHTML = 'All members are available';                    
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = bookAppointment;

                    document.getElementById(`js-book-appointment-${i}`).addEventListener('click', () => {
                        //Will handle the basic UI transformation when all the team is available
                        //Some basic validations are applied
                        let hourIni = document.getElementById(`setTime-ini-${i}`);
                        let hourEnd = document.getElementById(`setTime-end-${i}`);
                        if (hourIni.value.length && hourEnd.value.length) {
                            messages.displayMessage(true,'The appointment has been booked');
                            hourIni.value = '';
                            hourEnd.value = ''
                        } else {
                            messages.displayMessage(false,'Please choose a time range');
                        }                         
                    });                   
                }

                //HELP FUNCTIONS
                function setValuesForBookAppointment(appointmentData) {
                    appointmentData.forEach( ele => {
                        let totalUsersAvailable;
                        let templateForBooking;
                        if (ele.dates) {

                        } else {
                            totalUsersAvailable = ele.usersAvailable;
                        }
                        templateForBooking = `
                                    <label>${totalUsersAvailable} users available</label>
                                    <select id='dates-available-${i}'></select>
                                    <button id='js-book-availability-${i}' class='find-slot' type='button'>Book Appointment</button>
                                `;
                        
                        return ;
                    });
                }//END tooltipToBookAndBtnEvents() > setValuesForBookAppointment()

            }//End matchUserDaysWithCalendar() > tooltipToBookAndBtnEvents()

        }//End addAppointmentsToCalendar() > matchUserDaysWithCalendar()
        
    }// End addAppointmentsToCalendar()




    return {
        addAppointmentsToCalendar: addAppointmentsToCalendar
    }

})();