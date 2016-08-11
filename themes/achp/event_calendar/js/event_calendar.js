/*
  Implements event calendar feature.
*/

(function ($) {

  $(document).ready (function () {

    var instance = new FeatureInstance ();
  });

  // I. Defining the feature instance
  /*
  */
  function FeatureInstance () {
    this._instanceElement = createInstanceElement ();
    var bodyElement = this.getBodyElement ();
    this._calendar = new Calendar (bodyElement);
    this._grid = new Grid (bodyElement);
  }

  /*
  Accepts no arguments and returns a jQuery Element representing
  a feature instance.
  */
  function createInstanceElement () {
    var classPrefix = getFeatureClassPrefix ();

    return $('<div></div>')
      .addClass(classPrefix)
      .append ($('<div></div>')
        .addClass(classPrefix + '_header')
        .append ($('<h2></h2>')
          .addClass(classPrefix + '_title')))
      .append ($('<div></div>')
        .addClass(classPrefix + '_body'))
      .append($('<div></div>')
        .addClass(classPrefix + '_footer')
        .append($('<button><button>')
          .addClass(classPrefix + '_full_calendar_button')
          .text('View the full calendar')));
  }

  /*
  */
  FeatureInstance.prototype.getCalendar = function () {
    return this._calendar;
  }

  /*
  */
  FeatureInstance.prototype.getGrid = function () {
    return this._grid;
  } 

  /*
  */
  FeatureInstance.prototype.getInstanceElement = function() {
    return this._instanceElement;
  }

  /*
  Accepts a Date object, displays the the events matching that 
  date, and returns undefined.
  */
  function showEvents (date) {

  }

  /*
  Accepts one argument, a Date object, filters through all events to
  determine which ones occur on that date, and returns an Event array
  containing the events that do.
  */
  function filterEvents (date) {
    return getAllEvents ().filter (function (event) { return eventHasDate (event, date); });
  }

  /*
  */
  function getNEventsAfterDate (n, date) {

  }

  /*
  Accepts no arguments, returns an array of all
  Event objects.
  */
  function getAllEvents () {
    // TODO
  }

  /*
  Accepts two arguments:

  * event, an Event object
  * date, a Date object

  Returns true iff event occurs on given date.
  */
  function eventHasDate (event, date) {
    // TODO
  }

  /*
  Accepts no arguments, and returns this instance's body
  element as a jQuery HTML Element.
  */
  FeatureInstance.prototype.getBodyElement = function () {
    return $('.' + instanceBodyClassName (), this.getInstanceElement());
  }

  /*
  Accepts no arguments and returns the instance's
  body class name as a string.  
  */
  function instanceBodyClassName () {
    return getFeatureClassPrefix () + '_body';
  }  

  /*
    Accepts no arguments and returns a string that
    represents the standard prefix for feature classes.
  */
  function getFeatureClassPrefix () {
    return getModuleClassPrefix () + '_feature';
  } 

  // II. Defining the calendar component class

  /*
  */
  function Calendar (containerElement) {
    var self = this;
    // Create component element 
    var componentElement = createCalendarComponentElement ();

    // Embed CLNDR element
    componentElement.clndr({
      clickEvents: {
        click: self.onClick
      }
    });

    // Attach component element to container
    containerElement.append(componentElement);
  }

  /*
  */
  function createCalendarComponentElement () {
    var classPrefix = getCalendarClassPrefix ();

    return $('<div></div>')
      .addClass(classPrefix)
      .append ($('<div></div>')
        .addClass(classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass(classPrefix + '_title')
          .text('Calendar')))
      .append ($('<div></div>')
        .addClass(classPrefix + '_body')
        .append($('<div></div>')
          .addClass(classPrefix + '_container')));
  }

  /*
    Accepts one argument: target, a CLNDR Target object; and handles click events on
    the embedded CLNDR object.
  */
  Calendar.prototype.onClick = function (target) {

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
  */
  function Grid (containerElement) {
    this._componentElement = createGridComponentElement ();
    containerElement.append(this._componentElement);
  }

  /*
  Accepts no arguments; returns the Grid object's 
  component element as a jQuery HTML Element.
  */
  Grid.prototype.getComponentElement = function () {
    return this._componentElement;
  }

  /*
  */
  function createGridComponentElement () {
    var classPrefix = getGridClassPrefix ();    

    return $('<div></div>')
      .addClass(classPrefix)
      .append ($('<div></div>')
        .addClass(classPrefix + '_header')
        .append ($('<h3></h3>')
          .addClass(classPrefix + '_title')
          .text('Calendar')))
      .append ($('<div></div>')
        .addClass(getGridBodyClassName ()));
  }

  /*
  Accepts one argument: events, an array of Event objects;
  creates card elements to represent those events; displays
  them; and returns undefined.
  */
  Grid.prototype.displayEvents = function (events) {
    getGridBodyElement().empty().append(events.map (createCardElement));
  }

  /*
  Accepts one argument: event, an Event object; and returns
  a jQuery Element representing that event.
  */
  function createCardElement (event) {
    var classPrefix = getGridClassPrefix () + '_card';  

    return $('<div></div>')
      .addClass(classPrefix)
      .append ($('<div></div>')
        .addClass(classPrefix + '_header')
        .append ($('<h4></h4>')
          .addClass(classPrefix + '_title')
          .text(event.title)))
      .append ($('<div></div>')
        .addClass(classPrefix + '_body')
        .append ($('<div></div>')
          .addClass(classPrefix + '_date'))
        .append ($('<div></div>')
          .addClass(classPrefix + '_location')
          .text(event.location)))
      .append($('<div></div>')
        .addClass(classPrefix + '_footer')
        .append ($('<div></div>')
          .addClass(classPrefix + '_read_more')
          .append($('<a></a>')
            .attr('href', event.url)
            .text('READ MORE')))
        .append ($('<div></div>')
          .addClass(classPrefix + '_google_calendar')));
  }

  /*
  Accepts no arguments, and returns the component's body
  element as a jQuery HTML Element.
  */
  function getGridBodyElement () {
    return $('.' + gridBodyClassName (), getComponentElement());
  }

  /*
  Accepts no arguments, and returns a string indicating
  the grid body class name.
  */
  function getGridBodyClassName () {
    return getGridClassPrefix () + '_body';
  }

  /*
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