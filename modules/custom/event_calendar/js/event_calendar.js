/*
  Implements event calendar feature.
*/

(function ($) {

  $(document).ready (function () {

    /*
    Instantiates an event calendar feature and appends it to the
    appropriate block
    */
    var instance = new FeatureInstance ();
    $('.event_calendar').append (instance.getInstanceElement ());

  });

  /*
  Accepts no arguments, returns an array of all Event objects.
  */
  function getAllEvents () {
    return drupalSettings.event_calendar.events
    .sort (function (event1, event2) {
      return moment (event1.start_date).isSameOrAfter (event2.start_date);
    });
  }  


  // I. Defining the feature instance

  /*
  Accepts no arguments. Creates Calendar and Grid objects and sets their click events
  and returns undefined.
  */
  function FeatureInstance () {
    var self = this;
    this._instanceElement = createInstanceElement ();
    var bodyElement = this.getBodyElement ();
    this._calendar = new Calendar (bodyElement);
    this._grid = new Grid (bodyElement);
    this._calendar.onClick (function (target) {
      self._grid.displayEvents (getEventsOnDay (target.date));
    })
    this._calendar.monthChange (function (month) {
      self._grid.displayEvents (getNEventsAfterDate (drupalSettings.event_calendar.num_events, month._d));
    })
    $(bodyElement).on('click', '.month', function (e) {
      var date = moment ($(e.target).text ()).date (1);
      self._grid.displayEvents (getNEventsInMonth (drupalSettings.event_calendar.num_events, date));
    })
    // $(bodyElement).on('click', '.month', this._calendar.monthClick (function (e) {
    //   var date = moment($(e.target).text()).date(1);
    //   self._grid.displayEvents (getNEventsInMonth (5, date));
    // }))

  }

  /*
  Accepts no arguments and returns a jQuery Element representing
  a feature instance.
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
  Accepts no arguments and returns the calendar belonging to
  Feature instance.
  */
  FeatureInstance.prototype.getCalendar = function () {
    return this._calendar;
  }

  /*
  Accepts no arguments and returns the grid belonging to
  Feature instance.
  */
  FeatureInstance.prototype.getGrid = function () {
    return this._grid;
  } 

  /*
  Accepts no arguments and returns the Feature instance
  HTML Element.
  */
  FeatureInstance.prototype.getInstanceElement = function () {
    return this._instanceElement;
  }

  /*
  Accepts a Moment object, displays the the events matching that 
  date, and returns undefined.
  */
  FeatureInstance.prototype.showEvents = function (date) {
    // TODO: n parameter should be Drupal setting
    this.getGrid ().displayEvents (getNEventsAfterDate (drupalSettings.event_calendar.num_events, date));
  }

  /*
  Accepts one argument, a Moment object, filters through all events to
  determine which ones occur on that date, and returns an Event array
  containing the events that do.
  */
  function getEventsOnDay (date) {
    return getAllEvents ().filter (function (event) { return eventOnDay (event, date); })
    // if (eventsOnDay.length === 0) {
    //   console.log('No events on this day') } 
    // else {
    //   return eventsOnDay; 
    // }
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
  Accepts two arguments:

  * n, an integer
  * date, a string

  Returns an Event array of the next n events that end on or after date.
  */
  function getNEventsAfterDate (n, date) {
    return getAllEvents ()
      .filter (function (event) {
        return moment (event.end_date).isSameOrAfter (date);
      }).slice (0, n);
  }

  /*
  Accepts two arguments:

  * n, an integer
  * date, a string

  Returns an Event array of the next n events that either begin or end during
  the given date's month.
  */  
  function getNEventsInMonth (n, date) {
    return getAllEvents ()
      .filter (function (event) {  
        return moment (event.end_date).get ('month') === moment (date).get ('month')
          || moment (event.start_date).get ('month') === moment (date).get ('month');
      }).slice (0, n);
  }

  /*
  Accepts two arguments:

  * event, an Event object
  * date, a string

  Returns true iff event occurs on same day as given date.
  */
  function eventHasDay (event, date) {
    return moment (event.date).isSame (date, 'day');
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

  // II. Defining the calendar component class

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
    this.getContainerElement().clndr ({
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

    // Attach component element to container
    containerElement.append (this._componentElement);
  }

  /*
  Accepts two arguments, strings representing dates. Returns an Array
  of strings representing all the days between startDate and endDate,
  inclusive.
  */
  function getDaysBetween (startDate, endDate) {
    var format = 'YYYY MM DD';
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

  // TODO: make following 3 functions work?
  /*
  Accepts one argument: target, a CLNDR Target object; and handles click events on
  the month title element the calendar.
  */
  Calendar.prototype._monthClick = function (target) {
    return;
  }

  /*
  Accepts one argument: target, a CLNDR Target object; and calls this 
  component's onClick event handler on target.
  */
  Calendar.prototype.callMonthClick = function (target) {
    this._monthClick (target);
  }

  /*
  Accepts one argument, a function that accepts a calendar target object and
  registers eventHandler as the function to be called when the user clicks
  on the calendar's month title element.
  */
  Calendar.prototype.monthClick = function (eventHandler) {
    this._monthClick = eventHandler;
  }

  /*
  Accepts no arguments, and returns the calendar container as a 
  jQuery Element.
  */
  Calendar.prototype.getContainerElement = function () {
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

  // III. Defining the grid component class

  /*
  Accepts one argument, an HTML Element; creates the Grid object's 
  component element and appends it to the container; and returns undefined.
  */
  function Grid (containerElement) {
    this._componentElement = createGridComponentElement ();
    containerElement.append (this._componentElement);
    this.displayEvents (getNEventsAfterDate (drupalSettings.event_calendar.num_events, moment ().format ()));
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
          .text ('Upcoming Events & Meetings')))
      .append ($('<div></div>')
        .addClass (getGridBodyClassName ()));
  }

  /*
  Accepts one argument: events, an array of Event objects;
  creates card elements to represent those events; displays
  them; and returns undefined.
  */
  Grid.prototype.displayEvents = function (events) {
    events.length > 0 ?
      this.getGridBodyElement ().empty ().append (events.map (createCardElement)) :
      this.getGridBodyElement ().empty ().append ($('<p></p>')
        .addClass('event_calendar_grid_message')
        .text('No events scheduled on this date')
        )
  }

  /*
  Accepts one argument: event, an Event object; and returns
  a jQuery Element representing that event.
  */
  function createCardElement (event) {
    var classPrefix = getGridClassPrefix () + '_card';  

    return $('<div></div>')
    .addClass (classPrefix + '_container')
      .append ($('<div></div>')
      .addClass (classPrefix)
      .append ($('<div></div>')
        .addClass (classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass (classPrefix + '_title')
          .append ($('<a></a>')
            .attr ('href', event.url)
            .text (event.title))))
      .append ($('<div></div>')
        .addClass (classPrefix + '_body')
        .append ($('<div></div>')
          .addClass (classPrefix + '_date')
          .append ($('<div></div>')
            .addClass (classPrefix + '_day')
            .text (moment (event.start_date).isSame (event.end_date, 'day') ?
              moment (event.start_date).format ('MMMM D, YYYY') :
              moment (event.start_date).format ('MMMM D, YYYY') + ' to ' + moment (event.end_date).format ('MMMM D, YYYY') 
              ))
           .append ($('<div></div>')
            .addClass (classPrefix + '_time')
            .text (moment (event.start_date).isSame (event.end_date, 'day') ?
              moment (event.start_date).format ('h:mm A') + ' to ' + moment (event.end_date).format ('h:mm A') :
              "")))
        .append ($('<div></div>')
          .addClass (classPrefix + '_mobile_date')
          .append($('<div></div>')
            .addClass (classPrefix + '_mobile_date_month')
            .text (moment (event.start_date).format ('MMM')))
          .append($('<div></div>')
            .addClass (classPrefix + '_mobile_date_day')
            .text (moment (event.start_date).format ('DD'))))
        .append ($('<div></div>')
          .addClass (classPrefix + '_location')
          .text (event.location)))
      .append ($('<div></div>')
        .addClass (classPrefix + '_footer')
        .append ($('<div></div>')
          .addClass (classPrefix + '_link read_more')
          .append ($('<a></a>')
            .attr ('href', event.url)
            .text ('READ MORE')))
        .append ($('<div></div>')
          .addClass (classPrefix + '_google_calendar')
          .click (function () {
            window.open (createGoogleCalendarLink (event), '_blank'); 
          }))));
  }

  /*
  Accepts one argument, an Event object; uses the properties of the object
  to construct a link that will create an event in a user's Google calendar;
  and returns the URL string.
  */
  function createGoogleCalendarLink (event) {
    return "http://www.google.com/calendar/event?action=TEMPLATE&text=" 
      + encodeURIComponent(event.title || "") 
      + "&dates=" + convertToGoogleCalendarTime(event.start_date) + "/" + convertToGoogleCalendarTime(event.end_date) 
      + "&details=" + encodeURIComponent(removeHTMLTags(event.body || "")) 
      + "&location=" + encodeURIComponent(event.location  || "");
  }

  /*
  Accepts one argument, a date string; returns a string that represents
  that date as a string in the UTC timezone in a format accepted by
  Google Calendar.
  */
  function convertToGoogleCalendarTime (date) {
    return convertToUTCTime (date).format('YYYYMMDDTHHmmss') + 'Z';
  }

  /*
  Accepts one argument, date, a string that represents a date in the system
  timezone, and returns a Moment object that represents that same date in UTC
  time.
  */
  function convertToUTCTime (date) {
    return moment (date).add (moment ().utcOffset (drupalSettings.event_calendar.system_timezone), 'minutes');
  }

  /*
  Accepts one argument, html, an HTML string, strips it of its HTML tags, and 
  returns a string.
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


  // IV. Auxiliary functions

  /*
    Accepts no arguments and returns a string that
    represents the standard prefix for all classes
    defined by this module.
  */
  function getModuleClassPrefix () {
    return 'event_calendar';
  } 

}(jQuery));