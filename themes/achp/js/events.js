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

  function appendGoogleCalenderLink () {
    $('.event_description')
      .append ($('<div></div>')
        .addClass (classPrefix + '_google_calendar')
        .click (function () {
          window.open (createGoogleCalendarLink (event), '_blank'); 
      }))   
  }

  /*
    Accepts one argument, an Event object; uses
    the properties of the object to construct a
    link that will create an event in a user's
    Google calendar; and returns the URL string.
  */
  function createGoogleCalendarLink (event) {
    return "http://www.google.com/calendar/event?action=TEMPLATE&text=" 
      + encodeURIComponent(event.title || "") 
      + "&dates=" + convertToGoogleCalendarTime(event.start_date) + "/" + convertToGoogleCalendarTime(event.end_date) 
      + "&details=" + encodeURIComponent(removeHTMLTags(event.body || "")) 
      + "&location=" + encodeURIComponent(event.location  || "");
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns a string that represents that
    date as a string in the UTC timezone in a
    format accepted by Google Calendar.
  */
  function convertToGoogleCalendarTime (date) {
    return convertToUTCTime (date).format('YYYYMMDDTHHmmss') + 'Z';
  }

  /*
    Accepts one argument: date, a Moment
    object that represents a date in the system
    timezone; and returns a Moment object that
    represents that same date in UTC time.
  */
  function convertToUTCTime (date) {
    return date.add (moment ().utcOffset (drupalSettings.event_calendar.system_timezone), 'minutes');
  }

  /*
    Accepts one argument, html, an HTML string,
    strips it of its HTML tags, and returns
    the resulting string.
  */
  function removeHTMLTags (html) {
    return $('<div></div>').html (html).text ();
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