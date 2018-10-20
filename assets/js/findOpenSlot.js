let findOpenSlot = (function() {
    let userMatch = [];
    let userMatchedId = [];
    let iniRange = 0, endRange = 0;
    function matchAvailability(e, resp) {
        let init = 0;
        let duration = 30;
                
        let usersWithAppointments = resp.data.filter(user => user.appointments.length !== 0);
        let totalUsers = usersWithAppointments.length;
        
        
       // let usersWithoutAppointments = resp.data.filter(user => user.appointments.length === 0);

        let arrAvailability = usersWithAppointments.map(user => setAppointmentStartEnd(user));

        let iterations = (14 * 60) - duration; 

        for (let i = 0; i < iterations; i++) {
           
          //  console.log(userMatch);
            if (userMatch.length === usersWithAppointments.length) {
                break;
            } else {
                userMatch = findOpenSlot(init,duration);
               // usersAvailable.push(userMatch);
            }

            ++init;
            ++duration;
        }

        // console.log('ini final: ' + init);
        // console.log('duration final: ' + duration);
       
        let cleanArrUsersAvailable = userMatch.filter( people => people.length > 0);
        console.log('xxxxxxxxxxxxx FINAL VAL xxxxxxxxxxxxxxxxxxx');
        console.log(cleanArrUsersAvailable);
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
       //alert(cleanArrUsersAvailable);

        function findOpenSlot(ini,duration) { 
            let cuco = [];
            for (let j = 0; j < arrAvailability.length; j++) {
               // console.log(arrAvailability[j].userId); //aa <= ini && bb <= duration &&
                if (userMatchedId.indexOf(arrAvailability[j].userId) >= 0) {
                   // como brincar cuando es más de un objeto matched
                   console.log('*************************se debe brincar el objeto en cuestion************');
                } else {
                    if (findAvailability(arrAvailability[j], ini, duration)) {
                      console.log('IS A MATCH');
                      console.log("ini: " + ini);
                      console.log("duration: " + duration) 
                      console.log(arrAvailability[j]);
                      console.log('****************************');
                      cuco.push(arrAvailability[j]);                    
                    }
                }
            }
            
            if (cuco.length === arrAvailability.length) {
                console.log("***********************FULL MATCH YATAHHH*****************");
                userMatchedId = [];
                return cuco;                
            } else {  
                console.log('-----still no full matches--------');
                if (userMatchedId.length) { // Review if it has been matches before perform unnecessary operations
                    console.log('--no full matches but some matches---');
                    console.log("ini: " +  ini);
                    console.log("iniRange: " + iniRange);
                    console.log("duration: " + duration);
                    console.log("endRange: " + endRange);
                    console.log(userMatchedId);
                    console.log('****************************************');
                    if (iniRange < ini && endRange < duration && findUserIdsMatches()) {
                        console.log('Reset until the range is fulfilled');
                        console.log(userMatchedId);
                        userMatchedId = [];
                        console.log('****************************************');
                    } 
                }                             
                return [];
            }

            //Help function
            function findUserIdsMatches(){
                for (let i = 0; i < arrAvailability.length; i++) {
                     if (userMatchedId.indexOf(arrAvailability[i].userId) >= 0) {
                        return true;
                     } else {
                        return false;
                     }
                 }
            }//End matchAvailability() > findOpenSlot() > findUserIdsMatches()

        }//End matchAvailability() > findOpenSlot();

        function findAvailability(person, ini, duration) {
            return person.availability.some( bookDay => { 
                 console.log(person);
                 console.log(bookDay);
                 console.log("ini: " + ini);
                 console.log("duration: " + duration)
                 console.log("start: " + bookDay.start);                 
                 console.log("end: " + bookDay.end);
                
                if (ini >= bookDay.start && duration <= bookDay.end) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDay.start;
                    endRange = bookDay.end;
                    console.log('ini mayor o igual start y duration menor o igual end');                    
                    console.log('person.userId: ' + person.userId);
                    console.log('userMatchedId: ' + userMatchedId);
                    console.log(person);  
                    console.log('****************************'); 
                    return true;

                } else if (ini > bookDay.start && duration > bookDay.end && ini < bookDay.end && (bookDay.end-ini) >= (duration-ini)) {
                   userMatchedId.push(person.userId);
                   iniRange = bookDay.start;
                   endRange = bookDay.end;
                   console.log('ini mayor start y duration mayor end');                   
                   console.log('person.userId: ' + person.userId);
                   console.log('userMatchedId: ' + userMatchedId);
                   console.log(person);  
                   console.log('****************************'); 
                    return true;
                } else if (ini < bookDay.start && duration < bookDay.end && duration > bookDay.start && (duration-bookDay.start) >= (duration-ini)) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDay.start;
                    endRange = bookDay.end;
                    console.log('ini menor start y duration mayor start');                    
                    console.log('person.userId: ' + person.userId);
                    console.log('userMatchedId: ' + userMatchedId);
                    console.log(person);  
                    console.log('****************************'); 
                    return true;
                } else {
                    console.log('nothing');
                    console.log('****************************');
                    return false;
                }
            });
        }//End matchAvailability() > findAvailability();

        function setAppointmentStartEnd(user) {
            let availability = user.appointments.map( endStart => {
                return {
                    "start": minsConverter(endStart.start, 'hrs'),
                    "end": minsConverter(endStart.end, 'hrs'),
                }
            });
            return {
                "userId": user.userId,
                "availability": availability
            }
        }//End matchAvailability() > setAppointmentStartEnd()

    }//End matchAvailability()


    //FUNCTIONS HELPERS
    // convert typed duration to mins, if necessary
    function minsConverter(hour, hourType) {
        if (!isNaN(hour)) {
            hour = hour.toString();
        }
        let convertedMins = 0;
        if (hourType === 'mins') {
            convertedMins = hour;
        } else if (hourType === 'hrs') {
            if (hour.includes(':')) { 
                let mins = hour.split(':');
                if (mins[0] === '24') {
                    mins[0] = '0';
                }
                convertedMins = (parseInt(mins[0]) * 60) + parseInt(mins[1]);
            } else {
                if (hour === '24') {
                    hour = '0';
                }
                convertedMins = parseInt(hour) * 60;
            }
        } else if (hourType === 'turn') {
            let mins = hour % 60;
            if (mins < 10) {
                mins = '0' + mins;
            }
            convertedMins = Math.floor( hour / 60) + ':' + mins;
        } else {
            messages.displayMessage(false, "Something is wrong please contact the Administrator");
            // some bad value was sent
        }
        return convertedMins;
    } // End minsConverter()

    return {
        matchAvailability: matchAvailability
    }

    /*

[  
   {  
      "userId":1,
      "availability":[  
         {  
            "start":640,
            "end":720
         },
         {  
            "start":600,
            "end":660
         }
      ]
   },
   {  
      "userId":2,
      "availability":[  
         {  
            "start":480,
            "end":600
         },
         {  
            "start":540,
            "end":630
         }
      ]
   },
   {  
      "userId":6,
      "availability":[  
         {  
            "start":640,
            "end":720
         },
         {  
            "start":600,
            "end":660
         }
      ]
   },
   {  
      "userId":7,
      "availability":[  
         {  
            "start":480,
            "end":600
         },
         {  
            "start":780,
            "end":930
         }
      ]
   }
]


    */

})();