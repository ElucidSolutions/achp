/*
  This module defines behavior for the individual
  Event page.

  Note: this module depends on the MomentJS
  library.
*/
(function ($) {
  /*
    Initializes all of the elements embedded
    within the current page when the page loads.
  */
  $(document).ready (function () {
    initElements ();
  });

  /*
    Accepts no arguments, initializes all of the
    elements embedded within the current page,
    and returns undefined.
  */
  function initElements () {
    initLinkContainerElements ();
  }

  /*
    Accepts no arguments; retrieves all of the
    link container elements embedded within
    the page; adds a link to each container
    element that, when clicked, will add the
    event represented by the container element to
    the user's Google calendar; adds the link to
    the container element; and returns undefined.
  */
  function initLinkContainerElements () {
    getLinkContainerElements ().each (
      function (i, containerElement) {
        initLinkContainerElement ($(containerElement));
    });
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; uses the data attributes
    in linkContainer to create a link to Google
    Calendar that, when clicked, will add the
    event represented by containerElement to
    the user's Google calendar; adds the link
    to containerElement; and returns undefined.
  */
  function initLinkContainerElement (containerElement) {
    containerElement.append (createLinkElement (
      getLinkContainerElementTitle (containerElement),
      getLinkContainerElementStartDate (containerElement),
      getLinkContainerElementEndDate (containerElement),
      getLinkContainerElementDescription (containerElement),
      getLinkContainerElementLocation (containerElement),
      getLinkContainerElementTimezone (containerElement)));
  }

  /*
    Accepts six arguments:

    * title, a string that represents an event
      title
    * startDate, a Moment object that represents
      the event's start date
    * endDate, a Moment object that represents
      the event's end date
    * description, a string that represents an
      event description
    * location, a string that represents the
      event's location
    * timezone, a string that represents the
      timezone code.

    and returns a jQuery HTML Element that
    represents a link that when clicked will add
    the given even to the user's Google calendar.
  */
  function createLinkElement (title, startDate, endDate, description, location, timezone) {
    return $('<a></a>')
      .addClass (getModuleClassPrefix ())
      .attr ('href', createLink (title, startDate, endDate, description, location, timezone))
      .text ('ADD TO YOUR CALENDAR');
  }

  /*
    Accepts six arguments:

    * title, a string that represents an event
      title
    * startDate, a Moment object that represents
      the event's start date
    * endDate, a Moment object that represents
      the event's end date
    * description, a string that represents an
      event description
    * location, a string that represents the
      event's location
    * timezone, a string that represents the
      timezone code.

    and returns a URL string that represents a
    link that when followed will add the given
    event to the user's google calendar.
  */
  function createLink (title, startDate, endDate, description, location, timezone) {
    return "http://www.google.com/calendar/event?action=TEMPLATE&text=" 
      + encodeURIComponent (title || "") 
      + "&dates=" + convertToGoogleCalendarTime (startDate, timezone) + "/" + convertToGoogleCalendarTime (endDate, timezone) 
      + "&details=" + encodeURIComponent (removeHTMLTags(description || "")) 
      + "&location=" + encodeURIComponent (location  || "");
  }

  /*
    Accepts two arguments:

    * date, a Moment object;
    * and timezone, a string that represents a
      timezone code

    and returns a string that represents that
    date as a string in the UTC timezone in a
    format accepted by Google Calendar.
  */
  function convertToGoogleCalendarTime (date, timezone) {
    return convertToUTCTime (date).format('YYYYMMDDTHHmmss') + 'Z';
  }

  /*
    Accepts two arguments:

    * date, a Moment object that represents a
      date in the system timezone
    * and timezone, a string that represents
      the system timezone

    and returns a Moment object that
    represents that same date in UTC time.
  */
  function convertToUTCTime (date, timezone) {
    return date.add (moment ().utcOffset (timezone));
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
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a string that
    represents the title of event represented
    by containerElement.
  */
  function getLinkContainerElementTitle (containerElement) {
    return containerElement.attr (getModuleAttributePrefix () + '-link-title');
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a Moment
    object that represents the start date of
    the event represented by containerElement
  */
  function getLinkContainerElementStartDate (containerElement) {
    return moment (containerElement.attr (getModuleAttributePrefix () + '-link-start'));
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a Moment
    object that represents the end date of the
    event represented by containerElement.
  */
  function getLinkContainerElementEndDate (containerElement) {
    return moment (containerElement.attr (getModuleAttributePrefix () + '-link-end'));
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a string that
    represents a description of the event
    represented by containerElement.
  */
  function getLinkContainerElementDescription (containerElement) {
    return containerElement.attr (getModuleAttributePrefix () + '-link-description');
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a string that
    represents the location of the event
    represented by containerElement.
  */
  function getLinkContainerElementLocation (containerElement) {
    return containerElement.attr (getModuleAttributePrefix () + '-link-location');
  }

  /*
    Accepts one argument: containerElement, a
    jQuery HTML Element that represents a link
    container element; and returns a string
    that represents the date timezone given
    by containerElement.
  */
  function getLinkContainerElementTimezone (containerElement) {
    return containerElement.attr (getModuleAttributePrefix () + '-link-timezone');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Set that represents the link container
    elements embedded in the current page.
  */
  function getLinkContainerElements () {
    return $('.' + getModuleClassPrefix () + '_link_container');
  }

  /*
    Accepts no arguments and returns a string
    that represents the prefix used by every
    data attribute created by this module.
  */
  function getModuleAttributePrefix () { return 'data-achp-event-page'; }

  /*
    Accepts no arguments and returns a string
    that represents the prefix used by every
    class created by this module.
  */
  function getModuleClassPrefix () { return 'achp_event_page'; }

}) (jQuery);
