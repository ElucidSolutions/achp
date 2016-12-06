/*
  This library replaces Add Event Block elements with links
  that add events to Google Calendar.
*/

(function ($) {

  /*
    When page loads, replaces Add Event Block elements with
    links that add events to Google Calendar.
  */
  $(document).ready (function () {

    initAddEventContainerElements ();

  });

  /*
    Accepts no arguments, initializes all of the Add 
    Event container elements on the page, and returns
    undefined.
  */
  function initAddEventContainerElements () {
    var event = getCurrentEvent ();
    getAddEventContainerElements ().each (function (i, containerElement) {
      $(containerElement).append (createLinkElement (event));
    });
  }

  /*
    Accepts one argument, event, an object representing an
    Event, and returns a jQuery HTML Element that
    represents a link that, when clicked, adds the event
    to a Google calendar.
  */
  function createLinkElement (event) {

    return $('<div></div>')
      .addClass (getAddEventLinkElementClassName ())
      .click (function () {
        window.open (createGoogleCalendarLink (event), '_blank'); 
    });
  }


  /*
    Accepts one argument, event, an object representing an 
    Event, and returns a string that represents the 
    URL that, when clicked, adds the event to a Google 
    calendar.
  */
  function createGoogleCalendarLink (event) {
    // console.log(removeHTMLTags(event.body || ""));
    console.log(event.location);
    return "http://www.google.com/calendar/event?action=TEMPLATE&text=" 
      + encodeURIComponent(event.title || "") 
      + "&dates=" + convertToGoogleCalendarTime(event.start_date) + "/" + convertToGoogleCalendarTime(event.end_date) 
      + "&details=" + encodeURIComponent(removeHTMLTags(event.body || "")) 
      + "&location=" + encodeURIComponent(removeHTMLTags(addSpaceToLineBreaks(event.location) || ""));
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
    return date.add (moment ().utcOffset (drupalSettings.add_event.system_timezone), 'minutes');
  }

  /*
    Accepts one argument: eventValue, a string; and 
    returns eventValue with a space preceding any
    line breaks, so that when the HTML is stripped from
    the string the two lines are separated.
  */
  function addSpaceToLineBreaks (eventValue) {
    return eventValue && eventValue.indexOf('<br') >= 0 ? 
      eventValue.replace('<br', ' <br') :
      eventValue;
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
    Accepts no arguments and returns an object that represents
    the event associated with the current page.
  */
  function getCurrentEvent () {
    var _EVENT = drupalSettings.add_event.event;
    _EVENT.start_date = moment(_EVENT.start_date)
    _EVENT.end_date = moment(_EVENT.end_date)
    return _EVENT;
  }

  /*
    Accepts no arguments and returns the Add Event Container
    elements that are on the current page as a jQuery HTML
    Set.
  */
  function getAddEventContainerElements () {
    return $('.' + getAddEventContainerElementClassName ());
  }

  /*
    Returns a string that represents the class used to label
    Add Event Container elements.
  */
  function getAddEventContainerElementClassName () {
    return getClassPrefix () + '_container';
  }

  /*
    Returns a string that represents the class used to label
    Add Event link elements.
  */
  function getAddEventLinkElementClassName () {
    return getClassPrefix () + '_link';
  }

  /*
    Returns a string representing the prefix for all classes
    defined by this module.
  */
  function getClassPrefix () {
    return 'add_event';
  }

}(jQuery));