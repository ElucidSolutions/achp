/* 
  Behavior for event landing page. Used for overrides to the event-calendar.js
  file within the event_calendar custom module.
*/

(function ($) {

  $(document).ready (function () {

    reformatEventDates ();

  })

  /*
  */
  function reformatEventDates () {
    var startDateString = $(".field_event_start_date time").text ();
    var startDate = startDateString.slice (startDateString.indexOf(', ') + 2, startDateString.indexOf(' -'))
      + ' ' + startDateString.slice (startDateString.indexOf(' - ') + 3);
    // console.log(startDate);
    // var startDate = moment($(".field_event_start_date time").text ());
    // var endDate = moment($(".field_event_end_date time").text ());
    // var targetDiv = $(".field_event_end_date time");
    // var classPrefix = 'reformatted_event';
    console.log(moment(startDate));
    // console.log(startDate.format ('MMMM D, YYYY'));

    // targetDiv.append($('<div></div>')
    //   .addClass (classPrefix + '_date')
    //   .append ($('<div></div>')
    //     .addClass (classPrefix + '_start')
    //     .text (startDate.isSame (endDate, 'day') ?
    //       startDate.format ('MMMM D, YYYY') :
    //       startDate.format ('MMMM D, YYYY') + " to"))
    //   .append ($('<div></div>')
    //     .addClass (classPrefix + '_end')
    //     .text (startDate.isSame (endDate, 'day') ?
    //       "" : endDate.format ('MMMM D, YYYY')))
    //   .append ($('<div></div>')
    //     .addClass (classPrefix + '_time')
    //     .text (startDate.isSame (endDate, 'day') ?
    //       startDate.format ('h:mm A') + ' to ' + endDate.format ('h:mm A') :
    //       "")))
  }

  function formatDatesForMoment (dateString) {
    return moment(dateString.slice (dateString.indexOf(', ') + 2, dateString.indexOf(' -'))
      + ' ' + dateString.slice (dateString.indexOf(' - ') + 3));
  }

}) (jQuery);