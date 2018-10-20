let usersAppointments = (function() {
// add icon for booked days in the calendar
// add events for book an appointment
    
    
    
    function addAppointmentsToCalendar(resp) { 
        let localData = JSON.parse(JSON.stringify(resp.data));
        let getUsersBookedDays = (() => {
            let usersWithAppointments = localData.filter( user => user.appointments.length !== 0);
            let getDaysBooked = usersWithAppointments.map( person => getDays(person.appointments) ).join();
            let bookedDays = arrangeArrays(getDaysBooked);
            return bookedDays;
            //Helper functions
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
        matchUserDaysWithCalendar();

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
                    if (dayNode.querySelectorAll('.booked-icon').length){ 
                        setTooltipForBookAppointment(true,dayNode);
                    } else {
                        setTooltipForBookAppointment(false,dayNode);
                    } 
                } 
            }
            //Helper functions
            function createImageIconBooked(node) {
                var imgs = document.createElement('IMG');
                imgs.setAttribute('src', 'assets/images/icons/calendar-and-clock.svg');
                imgs.setAttribute('class','booked-icon');
                imgs.setAttribute('alt', 'Booked');
                node.appendChild(imgs);
            }//End matchUserDaysWithCalendar() > createImageIconBooked()
            function setTooltipForBookAppointment(type,dayNode){
                //true, check for availability
                //console.log(dayNode);
                if (type) {                    
                    let formCheckAvailabilty = `
                          <form>
                             <label for="duration">Appointment Duration</label>
                             <input id="duration" type="text">
                             <select>
                                <option val="mins">mins</option>
                                <option val="mins">hrs</option>
                             </select>
                             <button class="find-slot">Find availability</button>
                          </form>                         
                    `;
                    dayNode.querySelector('h2').innerHTML = 'Check for Availabilty';
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = formCheckAvailabilty;
                } else {                    
                    let bookAppointment = `
                          <input type="time" id="setTime" class="set-time" name="appt-time" min="1:00" max="24:00" required />
                          <span> to </span>
                          <input type="time" id="setTime" class="set-time" name="appt-time" min="1:00" max="24:00" required />
                          <button id="js-book-appointment" class="book-appointment">Book Appointment</button>                          
                    `;
                    dayNode.querySelector('h2').innerHTML = 'All members are available';                    
                    dayNode.querySelector('.js-form-book-appointment').innerHTML = bookAppointment;
                    let lele = document.getElementById('js-book-appointment');
                    
                    lele.addEventListener('click', (e) => {
                        console.log('cloc');
                        // displayMessage(true,"The appointment has been booked");
                        // findOpenSlot.matchAvailability(e, data)
                    });
                }

            }//End matchUserDaysWithCalendar() > setTooltipForBookAppointment()

        }//End addAppointmentsToCalendar() > matchUserDaysWithCalendar()
        
    }// End addAppointmentsToCalendar()




    return {
        addAppointmentsToCalendar: addAppointmentsToCalendar
    }

})();