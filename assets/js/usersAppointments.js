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
            let usersWithAppointments = localData.filter(user => user.appointments.length !== 0);
            let getDaysBooked = usersWithAppointments.map(person => getDays(person.appointments)).join();
            let bookedDays = arrangeArrays(getDaysBooked);
            return bookedDays;

            // HELP FUNCTIONS

            // In one day a user might have more than one appointment
            function arrangeArrays(arr) {
                let sortDays = arr.split(',').sort((a, b) => a - b);
                let eliminateDuplicates = [];
                for (let i = 0; i < sortDays.length; i++) {
                    if (eliminateDuplicates.indexOf(sortDays[i]) === -1) {
                        eliminateDuplicates.push(sortDays[i]);
                    }
                }
                return eliminateDuplicates;
            } // End getUsersBookedDays() > arrangeArrays()  

            function getDays(appointments) {
                return appointments.map(days => days.day).join();
            } // End getDays() > arrangeArrays()

        })(); // End addAppointmentsToCalendar() > getUsersBookedDays

        matchUserDaysWithCalendar(); //This function does most of the work described at the top

        function matchUserDaysWithCalendar() {
            let currentDay;
            let getNodeDays = document.getElementsByClassName('js-date'); //Gets the HTMLCollection of elements with class Date  

            for (let i = 0; i < getUsersBookedDays.length; i++) { //Finds which elements are valid elements of days
                let dayNode = getNodeDays.namedItem('js-date-' + getUsersBookedDays[i]).parentElement;
                if (dayNode) {
                    createImageIconBooked(dayNode); //Inserts the red icon calendar for days with one or more appointments
                }
            }

            for (let i = 0; i < getNodeDays.length; i++) {
                if (getNodeDays[i].parentElement.className.includes('js-tooltip')) {
                    let dayNode = getNodeDays[i].parentElement;
                    if (dayNode.querySelectorAll('.js-booked-icon').length) {
                        tooltipToBookAndBtnEvents(true, dayNode, i); //This creates tooltip for days with booked appointments
                    } else {
                        tooltipToBookAndBtnEvents(false, dayNode, i); //This creates tooltip for days where all the team is available
                    }
                }
            }

            // HELP FUNCTIONS
            function tooltipToBookAndBtnEvents(type, dayNode, i) {
                /* This function besides the tooltip creations, also creates the button events, sends data to the logic that is going
                   to handle the query (findOpenSlot.js), and also handles the response to render the proper UI
                   Type true, check for availability
                   Type false, all the users are available
                */
                let identifier = i;
                if (type) {
                    let formCheckAvailabilty = `
                          <form class='js-availability-form'>
                             <label for='duration-${identifier}'>Appointment Duration</label>
                             <input id='duration-${identifier}' type='number'>
                             <select id='minsHours-${identifier}'>
                                <option val='mins'>mins</option>
                                <option val='hrs'>hrs</option>
                             </select>
                             <button id='js-find-availability-${identifier}' class='btn-open-slot' type='button'>Find availability</button>
                          </form>       
                    `;
                    dayNode.querySelector('.js-tooltip-title').innerHTML = 'Check for Availabilty';
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = formCheckAvailabilty;
                    document.getElementById(`js-find-availability-${identifier}`)
                        .addEventListener('click', (event) => {
                            event.preventDefault(); // Allows to keep open the tooltip to hold the UI change after the query
                            queryAndResponseOpenSlots(event, identifier);
                        });
                } else {
                    let bookAppointment = `
                          <input type='time' id='setTime-ini-${identifier}' class='set-time' name='appt-time' min='1:00' max='24:00' required />
                          <span> to </span>
                          <input type='time' id='setTime-end-${identifier}' class='set-time' name='appt-time' min='1:00' max='24:00' required />
                          <button id='js-book-appointment-${identifier}' class='btn-open-slot team' type='button'>Book Appointment</button>                          
                    `;
                    dayNode.querySelector('.js-tooltip-title').innerHTML = 'All members are available';
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = bookAppointment;
                    document.getElementById(`js-book-appointment-${identifier}`)
                        .addEventListener('click', (event) => validateAndPost(event, identifier));
                } // End if (type) else

                // HELP FUNCTIONS
                function queryAndResponseOpenSlots(event, identifier) {
                    /*  Button js-find-availability-${identifier} will send the necessary values to findOpenSlot in order to find availability
                        Some basic validations are applied for inputs and also some basic UI transformations inside the tooltip
                    */
                    let currentDay =  event.target.getAttribute('id').split('-').pop();
                    let durationTime = document.getElementById(`duration-${identifier}`).value;
                    let minsHours = document.getElementById(`minsHours-${identifier}`).value;
                    let objConfig = {
                        "currentDay": currentDay,
                        "event": event,
                        "localData": localData,
                        "durationTime": durationTime,
                        "minsHours": minsHours
                    }
                    // Simple input duration validation
                    if (durationTime.trim().length) {
                        // Will return the answer of the query to find open slots
                        let availabilityDates = findOpenSlot.matchAvailability(objConfig); 
                        let btnBook = valsMatchedUSersBook(availabilityDates, identifier); // Retrieves the UI with respective information, after query
                        // If there are matches, it will render a different tooltip UI in order to choose open slots and book the appointment
                        if (availabilityDates[1].usersAvailable) {
                            let selectOpenSlots;
                            dayNode.querySelector('.js-tooltip-title').innerHTML = 'The team is available';
                            dayNode.querySelector('.js-tooltip-title').style.color = 'green';
                            dayNode.querySelector('.js-availability-form').parentElement.innerHTML = btnBook;
                            document.getElementById(`dates-available-${identifier}`).onchange = (ev) => {
                                selectOpenSlots = ev.target.value;
                            }
                            document.getElementById(`js-book-availability-${identifier}`)
                                .addEventListener('click', (event) => validateAndPost(event, identifier, selectOpenSlots));
                        } else {
                            window.scrollTo(0,0);
                            document.getElementById(`duration-${identifier}`).value = '';
                            messages.displayMessage(false, 'Sorry, there are no open slots');
                        }
                    } else {
                        window.scrollTo(0,0);
                        messages.displayMessage(false, 'Please set a Duration');
                    }
                } // End  tooltipToBookAndBtnEvents() > queryAndResponseOpenSlots()

                function valsMatchedUSersBook(availabilityDates, identifier) {
                    let totalUsersAvailable;
                    let templateForBooking = '',
                        scheduleOptions = '';
                    // More extensive in lines of code, but is quickier than a forEach                       
                    for (let i = 0; i < availabilityDates.length; i++) {
                        let dates = availabilityDates[i].dates;
                        if (dates) {
                            for (var j = 0; j < dates.length; j++) {
                                scheduleOptions += `<option value='${dates[j].ini}-${dates[j].end}'>${dates[j].ini} to ${dates[j].end}</option>`;
                            }
                        } else {
                            totalUsersAvailable = availabilityDates[i].usersAvailable;
                        }
                        totalUsersAvailable > 1 ? hasHave = 'have' : hasHave = 'has';
                        templateForBooking = `                      
                                    <label>${totalUsersAvailable} users ${hasHave} open slots:</label>
                                    <select id='dates-available-${identifier}'>
                                         <option>Select Open Slot</option>
                                         ` + scheduleOptions + `
                                    </select>
                                    <button id='js-book-availability-${identifier}' class='btn-open-slot matchedUsers' type='button'>Book Appointment</button>
                        `;
                    }
                    return templateForBooking;
                } // End tooltipToBookAndBtnEvents() > valsMatchedUSersBook()

                function validateAndPost(event, identifier, openSlots) {
                    /* Will handle the basic UI transformation when all the team is available
                       Some basic validations are applied
                       Simulates that the Post is successful
                    */
                    let classIdentifier = event.target.classList[1];
                    
                    window.scrollTo(0,0);
                   
                    if (classIdentifier === 'team') {
                        let hourIni = document.getElementById(`setTime-ini-${identifier}`);
                        let hourEnd = document.getElementById(`setTime-end-${identifier}`);
                        if (hourIni.value.length && hourEnd.value.length) {
                            messages.displayMessage(true, 'The appointment has been booked');
                            hourIni.value = '';
                            hourEnd.value = ''
                        } else {
                            messages.displayMessage(false, 'Please choose a time range');
                        }
                    } else if (classIdentifier === 'matchedUsers') {
                        if (openSlots) {
                            messages.displayMessage(true, 'The appointment has been booked');
                        } else {
                            messages.displayMessage(false, 'Please choose an open slot');
                        }
                    } else {
                        messages.displayMessage(false, 'Something went wrong, please contact your administrator');
                    }


                } // End tooltipToBookAndBtnEvents() > validateAndPost()

            } // End matchUserDaysWithCalendar() > tooltipToBookAndBtnEvents()

            function createImageIconBooked(node) {
                var imgs = document.createElement('IMG');
                imgs.setAttribute('src', 'assets/images/icons/calendar-and-clock.svg');
                imgs.setAttribute('class', 'js-booked-icon booked-icon');
                imgs.setAttribute('alt', 'Booked Day');
                node.appendChild(imgs);
            } // End matchUserDaysWithCalendar() > createImageIconBooked()

        } // End addAppointmentsToCalendar() > matchUserDaysWithCalendar()

    } // End addAppointmentsToCalendar()




    return {
        addAppointmentsToCalendar: addAppointmentsToCalendar
    }

})();