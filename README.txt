PLEASE READ THE SERVICE DEFINITION IN THE COMMENTS OF assets/js/fetchUsers.js
=============================================================================

THE DAY WITH TEST CASES IS 8

=============================================================================

THIS FILES CONTAINS:

I.- USER CASE DESCRIPTION
II.- SCAFFOLDING DESCRIPTION
III.- EXTRA COMMENTS ABOUT THE APPLICATION

=============================================================================

I.- USER CASE DESCRIPTION:

As a user I want to book an appointment, for all the members of the team.

To do that, I have to select the day when I want to book the appointment, so two escenarios exist:

1.- All the members of the team are available all the days without the red calendar icon.
    a) To book the appointment I need to click on the day
    b) Set the time (start and end)
    c) Send the requests clicking the Book Appointment button.

2.- The days with the red calendar icon means that all or some of the members of the team has appointments.
    a) To book the appointment, first is necessary to check people availability. For that, is necessary set
    the duration of the meeting typing numbers, then select if the numbers refers to minutes (mins) or hours (hrs).
    The format accepted is 24 hours.
    b) If the people who has appointments in that specific day, has no an open slot, a message will come out at the top.
    c) If the people who has appointments in that specific day, has an open slot, the tooltip will change.
       c.1) Now the user has to choose the starting available time for the meeting.
       c.2) Send the request clicking the Book Appointment button.

II.- SCAFFOLDING DESCRIPTION:

1.- index.html: Contains all the HTML for the application, and the call to the resources needed (js,css). 
    JQuery was used only as a resource to use $.ajax method
2.- assets: Contains all images, css and js, except for JQuery a CDN was used.
3.- assets/images: This contains only a SVG icon, to depict when a day has one or more appointments booked.
4.- assets/css: Contains a SMACSS like structure. Could have been done with SASS and compile everything at the end in just one file.
5.- assets/js: Contains all the js files separated un concerns.  Could have been used ES6 export/import 
    but is even less supported as far as I know, for this case a transpiler was needed.



III.- EXTRA COMMENTS ABOUT THE APPLICATION:

* The UI is responsive, although not all the breaking points where thoroughly adjusted, 
because is an exercise and I tried to develop it fast.

* There are more combinations of appointments schedules that were not tested.

* The application still can be optimized.


