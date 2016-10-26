/* 
  Behavior for event landing page. Used for overrides to the event-calendar.js
  file within the event_calendar custom module.
*/

(function ($) {

  $(document).ready (function () {

    reformatEventItemDates ();
  
  })
  /*
    Accepts no arguments, appends an event's reformatted dates, 
    and returns undefined.
  */
  function reformatEventItemDates () {
    var startDate = moment(getEventStartDateElement ().text ());
    var endDate = moment(getEventEndDateElement ().text ());
    getEventStartDateElement ().remove ()
    getEventEndDateElement ().remove ()
    var classPrefix = 'event_date';
    console.log('1');

    getEventFieldContainer ().append($('<div></div>')
      .addClass (classPrefix)
      .append ($('<span</span>')
        .addClass (classPrefix + '_start')
        .text (startDate.isSame (endDate, 'day') ?
          startDate.format ('MMMM D, YYYY') :
          startDate.format ('MMMM D, YYYY') + " - "))
      .append ($('<span></span>')
        .addClass (classPrefix + '_end')
        .text (startDate.isSame (endDate, 'day') ?
          "" : endDate.format ('MMMM D, YYYY')))
      .append ($('<div></div>')
        .addClass (classPrefix + '_time')
        .text (startDate.isSame (endDate, 'day') ?
          startDate.format ('h:mm A') + ' to ' + endDate.format ('h:mm A') :
          "")))
  }

  /*
    Accepts no arguments and returns a jQuery Element
    representing the event field container.
  */
  function getEventFieldContainer () {
    return $('.event_item_field.event_date');
  }

  /*
    Accepts no arguments and returns a jQuery Element
    representing the event's start date.
  */
  function getEventStartDateElement () {
    return $('.field_event_start_date'); 
  }

  /*
    Accepts no arguments and returns a jQuery Element
    representing the event's end date.
  */
  function getEventEndDateElement () {
    return $('.field_event_end_date'); 
  }

}) (jQuery);