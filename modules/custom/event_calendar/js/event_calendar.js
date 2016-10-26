/*
  Implements event calendar feature.
*/

(function ($) {
  // Stores the event objects.
  var _EVENTS = null;

  $(document).ready (function () {
    /*
      Instantiates an event calendar feature
      and appends it to the appropriate block.
    */
    var instance = new FeatureInstance ();
    $('.event_calendar').append (instance.getInstanceElement ());
  });

  // I. Event functions.

  /*
    Accepts one argument: date, a Moment object;
    and returns the first n events occuring
    on the day represented by date, where n is
    given by the num_events module setting.
  */
  function getEventsOnDay (date) {
    return getNEventsOnDay (drupalSettings.event_calendar.num_events, date);
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns the first n events that end on
    or after the day represented by date, where
    n is given by the num_events module setting.
  */
  function getEventsAfterDay (date) {
    return getNEventsAfterDay (drupalSettings.event_calendar.num_events, date);
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns the first n events that start or
    end within the month represented by date,
    where n is given by the num_events module
    setting.
  */
  function getEventsInMonth (date) {
    return getNEventsInMonth (drupalSettings.event_calendar.num_events, date);
  }

  /*
    Accepts two arguments:

    * n, an integer
    * and date, a Moment object
  */
  function getNEventsOnDay (n, date) {
      return getAllEventsOnDay (date).slice (0, n);
  }

  /*
    Accepts two arguments:

    * n, an integer
    * date, a Moment object

    Returns an Event array of the next n events
    that end on or after the day represented
    by date.
  */
  function getNEventsAfterDay (n, date) {
      return getAllEventsAfterDay (date).slice (0, n);
  }

  /*
    Accepts two arguments:

    * n, an integer
    * date, a Moment object

    Returns an Event array of the next n events
    that either begin or end in the month
    represented by date.
  */  
  function getNEventsInMonth (n, date) {
    return getAllEventsInMonth (date).slice (0, n);
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns all of those events that start
    or end on the day represented by date.
  */
  function getAllEventsOnDay (date) {
    return getAllEvents ().filter (function (event) { return eventOnDay (event, date); })
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns all of those events that end on
    or after the day represented by date.
  */
  function getAllEventsAfterDay (date) {
    return getAllEvents ().filter (function (event) { return eventAfterDay (event, date); })
  }

  /*
    Accepts one argument: date, a Moment object;
    and returns all of those events that start
    or end in the month represented by date.
  */
  function getAllEventsInMonth (date) {
    return getAllEvents ().filter (function (event) { return eventInMonth (event, date); })
  }

  /*
    Accepts two parameters

    * event, an Event object
    * and date, a Moment object

    and returns true iff event's start or end
    dates lie within the month represented
    by date.
  */
  function eventInMonth (event, date) {
    return event.end_date.isSame (date, 'month')
      || event.start_date.isSame (date, 'month');
  }

  /*
    Accepts two parameters

    * event, an Event object
    * and date, a Moment object

    and returns true iff event's end date is
    on or after the day represented by date.
  */
  function eventAfterDay (event, date) {
    return moment (event.end_date).isSameOrAfter (date, 'day');
  }

  /*
    Accepts two parameters:

    * event, an Event object
    * date, a Moment object

    Returns true iff the event's start date is on or before the same 
    day as date, and the end date is on or after the same day as date.
  */
  function eventOnDay (event, date) {
    return moment (event.start_date).isSameOrBefore (date, 'day') 
      && moment (event.end_date).isSameOrAfter (date, 'day');
  }

  /*
    Accepts no arguments, returns an array of
    all Event objects.
  */
  function getAllEvents () {
    return _EVENTS || loadEvents ();
  }  

  /*
    Accepts no arguments, loads, and sorts the
    event objects before string them in the
    _EVENTS array.
  */
  function loadEvents () {
    // load raw events into the _EVENTS array.
    _EVENTS = drupalSettings.event_calendar.events;
    // convert dates from strings to Moment objects.
    _EVENTS.forEach (function (event) {
      event.start_date = moment (event.start_date);
      event.end_date   = moment (event.end_date); 
      event.first_par = (event.body).substr(0, event.body.indexOf('</p>') + 4)
    });

    // sort the events by date.
    _EVENTS.sort (function (event1, event2) {
      return event1.start_date.isSameOrAfter (event2.start_date);
    });

    // returns the loaded events.
    return _EVENTS;
  }

  // II. Defining the feature instance

  /*
    Accepts no arguments. Creates Calendar and
    Grid objects and sets their click events
    and returns undefined.
  */
  function FeatureInstance () {
    var self = this;
    this._instanceElement = createInstanceElement ();
    var bodyElement = this.getBodyElement ();
    this._calendar = new Calendar (bodyElement);
    this._grid = new Grid (bodyElement);

    // link calendar events to grid responses.
    this._calendar.onClick (function (target) {
      self._grid.displayEventsForDay (moment (target.date));
    })
    this._calendar.monthChange (function (month) {
      self._grid.displayEventsForMonth (moment (month._d));
    })
    this._calendar.monthClick (function (month) {
      self._grid.displayEventsForMonth (month);
    })
  }

  /*
    Accepts no arguments and returns a jQuery
    Element representing a feature instance.
  */
  function createInstanceElement () {
    var classPrefix = getFeatureClassPrefix ();

    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<h2></h2>')
          .addClass (classPrefix + '_title')))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body'))
      .append ($('<div></div>')
        .addClass (classPrefix + '_footer')
        .append ($('<button></button>')
          .addClass (classPrefix + '_full_calendar_button')
          .text ('View the full calendar')));
  }

  /*
    Accepts no arguments and returns the calendar
    belonging to Feature instance.
  */
  FeatureInstance.prototype.getCalendar = function () {
    return this._calendar;
  }

  /*
    Accepts no arguments and returns the grid
    belonging to Feature instance.
  */
  FeatureInstance.prototype.getGrid = function () {
    return this._grid;
  } 

  /*
    Accepts no arguments and returns the Feature
    instance HTML Element.
  */
  FeatureInstance.prototype.getInstanceElement = function () {
    return this._instanceElement;
  }

  /*
    Accepts a Moment object, displays the the
    events matching that date, and returns
    undefined.
  */
  FeatureInstance.prototype.showEvents = function (date) {
    this.getGrid ().displayEventsForMonth (date);
  }

  /*
  Accepts no arguments, and returns this instance's body
  element as a jQuery HTML Element.
  */
  FeatureInstance.prototype.getBodyElement = function () {
    return $('.' + instanceBodyClassName (), this.getInstanceElement ());
  }

  /*
  Accepts no arguments and returns the instance's body class 
  name as a string.  
  */
  function instanceBodyClassName () {
    return getFeatureClassPrefix () + '_body';
  }  

  /*
  Accepts no arguments and returns a string that represents 
  the standard prefix for feature classes.
  */
  function getFeatureClassPrefix () {
    return getModuleClassPrefix () + '_feature';
  } 

  // III. Defining the calendar component class

  /*
  Accepts one argument, an HTML Element; creates the CLNDR template 
  element and appends it to the container; and returns undefined.
  */
  function Calendar (containerElement) {
    var self = this;
    // Create component element 
    this._componentElement = createCalendarComponentElement ();
    var events = _.chain (getAllEvents ())
        .map (function (event) { return getDaysBetween (event.start_date, event.end_date); })
        .flatten ()
        .uniq ()
        .map (function (date) { return { date: date }; })
        .value ();

    // Embed CLNDR element
    var calendarContainerElement = this.getCalendarContainerElement ();
    calendarContainerElement.clndr ({
      template:         
        "<div class='clndr-controls'>" +
            "<div class='clndr-control-button'>" +
                "<span class='clndr-previous-button'></span>" +
            "</div>" +
            "<div class='month-container'><div class='month'><%= month %> <%= year %></div></div>" +
            "<div class='clndr-control-button rightalign'>" +
                "<span class='clndr-next-button'></span>" +
            "</div>" +
        "</div>" +
        "<table class='clndr-table' border='0' cellspacing='0' cellpadding='0'>" +
            "<thead>" +
                "<tr class='header-days'>" +
                "<% for(var i = 0; i < daysOfTheWeek.length; i++) { %>" +
                    "<td class='header-day'><%= daysOfTheWeek[i] %></td>" +
                "<% } %>" +
                "</tr>" +
            "</thead>" +
            "<tbody>" +
            "<% for(var i = 0; i < numberOfRows; i++){ %>" +
                "<tr>" +
                "<% for(var j = 0; j < 7; j++){ %>" +
                "<% var d = j + i * 7; %>" +
                    "<td class='<%= days[d].classes %>'>" +
                        "<div class='day-contents'><%= days[d].day %></div>" +
                    "</td>" +
                "<% } %>" +
                "</tr>" +
            "<% } %>" +
            "</tbody>" +
        "</table>",
      events: events,
      clickEvents: {
        click: _.bind (self.callOnClick, self),
        onMonthChange: _.bind (self.callMonthChange, self)
      }      
    });

    // Add month click event handler.
    $('.month', calendarContainerElement).click (function (e) {
      self.callMonthClick (moment ($(e.target).text (), 'MMMM YYYY'));
    });

    // Attach component element to container
    containerElement.append (this._componentElement);
  }

  /*
  Accepts two arguments, strings representing dates. Returns an Array
  of strings representing all the days between startDate and endDate,
  inclusive.
  */
  function getDaysBetween (startDate, endDate) {
    var format = 'YYYY-MM-DD';
    var dates = [moment (startDate).format (format)];
    for (var date = moment (startDate); date.isBefore (endDate); date.add (1, 'days')) {
      dates.push (date.format (format));
    }
    dates.push (moment (endDate).format (format));
    return dates;
  }

  /*
  Accepts no arguments and returns a jQuery Element representig
  the calendar component.
  */
  function createCalendarComponentElement () {
    var classPrefix = getCalendarClassPrefix ();

    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass (classPrefix + '_title')
          .text ('Calendar')))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body')
        .append ($('<div></div>')
          .addClass (getCalendarContainerClassName ())));
  }

  /*
  Accepts one argument: target, a CLNDR Target object; and handles click events on
  the embedded CLNDR object.
  */
  Calendar.prototype._onClick = function (target) {
    return;
  }

  /*
  Accepts one argument: target, a CLNDR Target object; and calls this 
  component's onClick event handler on target. 
  */
  Calendar.prototype.callOnClick = function (target) {
    this._onClick (target);
  }

  /*
  Accepts one argument, a function that accepts a calendar target object and
  registers eventHandler as the function to be called when the user clicks
  on a calendar date.
  */
  Calendar.prototype.onClick = function (eventHandler) {
    this._onClick = eventHandler;
  }

  /*
  Accepts one argument: target, a CLNDR Target object; and handles click events on
  the month navigation arrows on the calendar.
  */
  Calendar.prototype._monthChange = function (target) {
    return;
  }

  /*
  Accepts one argument: target, a CLNDR Target object; and calls this 
  component's onClick event handler on target.
  */
  Calendar.prototype.callMonthChange = function (target) {
    this._monthChange (target);
  }

  /*
  Accepts one argument, a function that accepts a calendar target object and
  registers eventHandler as the function to be called when the user clicks
  on the calendar's navigation arrows.
  */
  Calendar.prototype.monthChange = function (eventHandler) {
    this._monthChange = eventHandler;
  }

  /*
    Accepts one argument: date, a Moment Date
    object that represents the month that the
    user has just clicked on.
  */
  Calendar.prototype._monthClick = function (target) {
    return;
  }

  /*
    Accepts one argument: date, a Moment Date
    object that represents the month that the
    user has just clicked on; and passes date
    to this component's monthClick event handler.
  */
  Calendar.prototype.callMonthClick = function (date) {
    this._monthClick (date);
  }

  /*
    Accepts one argument: eventHandler, a
    function that accepts a Moment Date object;
    and registers eventHandler so that it is
    called whenever a user clicks on a month
    title in this calendar's month title.
  */
  Calendar.prototype.monthClick = function (eventHandler) {
    this._monthClick = eventHandler;
  }

  /*
  Accepts no arguments, and returns the calendar container as a 
  jQuery Element.
  */
  Calendar.prototype.getCalendarContainerElement = function () {
    return $('.' + getCalendarContainerClassName (), this.getComponentElement ());
  }

  /*
  Accepts no arguments; returns the Calendar object's 
  component element as a jQuery HTML Element.
  */
  Calendar.prototype.getComponentElement = function () {
    return this._componentElement;
  }

  /*
  Accepts no arguments and returns a string that
  represents the calendar container element's class name.
  */
  function getCalendarContainerClassName () {
    return getCalendarClassPrefix () + '_container';
  }

  /*
  Accepts no arguments and returns a string that
  represents the standard prefix for calendar classes.
  */
  function getCalendarClassPrefix () {
    return getModuleClassPrefix () + '_calendar';
  } 

  // IV. Defining the grid component class

  /*
  Accepts one argument, an HTML Element; creates the Grid object's 
  component element and appends it to the container; and returns undefined.
  */
  function Grid (containerElement) {
    this._componentElement = createGridComponentElement ();
    containerElement.append (this._componentElement);
    this.displayEventsForMonth (moment ());
  }

  /*
  Accepts no arguments; returns the Grid object's component element
  as a jQuery HTML Element.
  */
  Grid.prototype.getComponentElement = function () {
    return this._componentElement;
  }

  /*
  Accepts no arguments and returns a jQuery Element representig
  the grid component.
  */
  function createGridComponentElement () {
    var classPrefix = getGridClassPrefix ();    

    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass (classPrefix + '_title')
          .text ('Events & Meetings')))
      .append ($('<div></div>')
        .addClass (getGridBodyClassName ()));
  }

  /*
    Accepts one argument: date, a Moment
    object; and displays the events that should
    be displayed for the month represented
    by date.
  */
  Grid.prototype.displayEventsForMonth = function (date) {
    var today  = moment ();
    var format = 'MMMM' + (today.isSame (date, 'year') ? '' : ' YYYY');
    today.isSame (date, 'month') ?
      this.displayEvents (getEventsAfterDay (today), 'There are currently no upcoming events scheduled.') :
      this.displayEvents (getEventsInMonth (date),
        today.isBefore (date, 'month') ?
          'There are currently no events scheduled for ' + date.format (format) + '.':
          'There were no events in ' + date.format (format) + '.');
  }

  /*
    Accepts one argument: date, a Moment object;
    and displays the events that should be
    displayed for the day represented by date.
  */
  Grid.prototype.displayEventsForDay = function (date) {
    var events = getEventsOnDay (date);
    if (events && events.length > 0) {
      this.displayEvents (events, 'There ' + (moment ().isSameOrBefore (date, 'day') ? 'are' : 'were') + ' no events scheduled for ' + date.format ('dddd, MMMM Do YYYY') + '.');
    }
  }

  /* 
    Accepts two arguments:

    * events, an Event array
    * and message, a string

    and displays events. If events is empty,
    this function displays message instead.
  */
  Grid.prototype.displayEvents = function (events, message) {
    events.length > 0 ?
      this.getGridBodyElement ().empty ().append (events.map (createCardElement)) :
      this.getGridBodyElement ().empty ().append ($('<p></p>')
        .addClass ('event_calendar_grid_message')
        .text (message));
  }

  /*
  Accepts one argument: event, an Event object; and returns
  a jQuery Element representing that event.
  */
  function createCardElement (event) {
    var classPrefix = getGridClassPrefix () + '_card';
    var readMoreMessage;

    $('.event_calendar').closest($('#events_landing_page')).length > 0 ? 
      readMoreMessage = 'VIEW EVENT' : readMoreMessage = 'READ MORE';

    var TITLE_MAX_LINE_LENGTH = 25; // 19;
    var TITLE_MAX_NUM_LINES = 2;
    var LOCATION_MAX_LINE_LENGTH = 25; // 19;
    var LOCATION_MAX_NUM_LINES = 5;

    return $('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass (classPrefix + '_title')
          .append ($('<a></a>')
            .attr ('href', event.url)
            .text (ellipse (TITLE_MAX_LINE_LENGTH, TITLE_MAX_NUM_LINES, event.title)))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body')
        .append ($('<div></div>')
          .addClass (classPrefix + '_date')
          .append ($('<div></div>')
            .addClass (classPrefix + '_start')
            .text (event.start_date.isSame (event.end_date, 'day') ?
              event.start_date.format ('MMMM D, YYYY') :
              event.start_date.format ('MMMM D, YYYY') + " to"))
          .append ($('<div></div>')
            .addClass (classPrefix + '_end')
            .text (event.start_date.isSame (event.end_date, 'day') ?
              "" :
              event.end_date.format ('MMMM D, YYYY')))
           .append ($('<div></div>')
            .addClass (classPrefix + '_time')
            .text (event.start_date.isSame (event.end_date, 'day') ?
              event.start_date.format ('h:mm A') + ' to ' + event.end_date.format ('h:mm A') :
              "")))
        .append ($('<div></div>')
          .addClass(classPrefix + '_mobile_date_container')
          .append ($('<div></div>')
            .addClass (classPrefix + '_mobile_date')
            .append($('<div></div>')
              .addClass (classPrefix + '_mobile_date_month')
              .text (event.start_date.format ('MMM')))
            .append($('<div></div>')
              .addClass (classPrefix + '_mobile_date_day')
              .text (event.start_date.format ('DD')))))
        .append ($('<div></div>')
          .addClass (classPrefix + '_location')
          // .text (ellipse (LOCATION_MAX_LINE_LENGTH, LOCATION_MAX_NUM_LINES, event.location)))
          .html(event.location))
        .append ($('<div></div>')
          .addClass (classPrefix + '_description')
          .html (event.first_par)))      
      .append ($('<div></div>')
        .addClass (classPrefix + '_footer')
        .append ($('<div></div>')
          .addClass (classPrefix + '_google_calendar')
          .click (function () {
            window.open (createGoogleCalendarLink (event), '_blank'); 
          }))        
        .append ($('<div></div>')
          .addClass (classPrefix + '_link read_more')
          .append ($('<a></a>')
            .attr ('href', event.url)
            .text (readMoreMessage))));
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
  Accepts no arguments, and returns the component's body
  element as a jQuery HTML Element.
  */
  Grid.prototype.getGridBodyElement = function () {
    return $('.' + getGridBodyClassName (), this.getComponentElement ());
  }

  /*
  Accepts no arguments, and returns a string indicating
  the grid body class name.
  */
  function getGridBodyClassName () {
    return getGridClassPrefix () + '_body';
  }
  /*
  Accepts no arguments, and returns a string indicating
  the grid module's class prefix.
  */
  function getGridClassPrefix () {
    return getModuleClassPrefix () + '_grid';
  }


  // V. Auxiliary functions

  /*
    Accepts no arguments and returns a string that
    represents the standard prefix for all classes
    defined by this module.
  */
  function getModuleClassPrefix () {
    return 'event_calendar';
  } 

  /*
    Accepts three arguments:

    * maxLineLength, an integer
    * maxNumLines, an integer
    * and text, a string

    and returns a cropped version of text
    designed to fit within maxNumLines lines
    where each line has, at most, maxLineLength
    characters, and appends an ellipse onto the
    result if some characters were cropped.
  */
  function ellipse (maxLineLength, maxNumLines, text) {
    if (text === null) { return ''; }

    var index = 0;
    var numLines = 1;
    var currentLineLength = 0;
    while (index < text.length) {
      var word = text.slice (index).match (/\s*\S*/)[0];

      var newLineLength = currentLineLength + word.length;
      if (newLineLength <= maxLineLength) {
        // append the current word onto the end of the current line.
        currentLineLength = newLineLength;
        index += word.length;
      } else { // the current word will not fit onto the end of the current line.
        var remainingLineLength = maxLineLength - currentLineLength;
        if (word.length <= maxLineLength) {
          // wrap the current word onto the next line.
          if (numLines === maxNumLines) {
            return appendEllipsis (index + remainingLineLength, text.slice (0, index));
          }
        } else { // the current word will not fit on a single line.
          // break the current word across the line boundary.
          index += remainingLineLength;
          if (numLines === maxNumLines) {
            return appendEllipsis (index, text.slice (0, index));
          }
        }
        numLines ++;
        currentLineLength = 0;
      }
    }
    // if we reach here, the entire text fit within the given number of lines.
    return text;
  }

  /*
    Accepts two arguments:

    * maxLength, an integer
    * and text, a string

    trims text so that we can append an ellipsis
    to it while remaining within maxLength
    characters.
  */
  function appendEllipsis (maxLength, text) {
    if (maxLength - text.length >= 3) {
      // we can append an ellipsis and remain within the character limit.
      return text + '...';
    } else {
      // we can not fit the text and the ellipsis within the character limit.
      switch (text.length) {
        case 0:
          return '';
        case 1:
          return '.';
        case 2:
          return '..';
        default:
          return text.slice (0, ((maxLength - text.length) - 3)) + '...';
      }
    }
  }
}(jQuery));
