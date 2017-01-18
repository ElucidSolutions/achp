/* 
  Behavior for news landing page, excluding topic filter-specific
  behavior, which is located in view_term_list.js.
*/

(function ($) {

  var COLLAPSED = 'collapsed';
  var EXPANDED = 'expanded';
  var filterDisplayState = COLLAPSED;

  var STARTDATEINPUT = 'start date has input';
  var ENDDATEINPUT = 'end date has input';
  var BOTHDATEINPUT = 'both date fields have input';
  var NODATEINPUT = 'no date input';
  var dateInputState = NODATEINPUT;

  var newsLandingBreakpoint = '750px';

  Drupal.behaviors.news_landing = {
    attach: function (context, settings) {
      $(document).once ('news_landing').ajaxComplete (
        function (event, xhr, settings) {
          // initializes all of the filters on view updates.
          if (settings.url.indexOf ('/views/ajax') === 0) {
            // initializes the filter elements.          
            initDateFilterElements ();
            if (filterDisplayState === EXPANDED) {
              showFilter ();
            }
            if (dateInputState != NODATEINPUT) {
              getNewsFilterResetButton ().show ();
            }
          }
      });
    }
  }  

  $(document).ready (function () {

  // Displays filter options at widescreen; sets click listener at mobile
  // TNOTE/TODO: Returns error when I bring this outside of documentready
    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (min-width: ' + newsLandingBreakpoint + ')').matches;
        },
        enter: function () {
          showFilter ();
        }
      };
    })());    

    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (max-width: ' + newsLandingBreakpoint + ')').matches;
        },
        enter: function () {
          hideFilter ();
        }
      };
    })());

    initDateFilterElements ();

  })

  /*
    Accepts no arguments; wraps the Date filter in a
    container div, moves Date filter below Topic filter,
    and customizes the behavior and appearance of the 
    date filter inputs; and returns undefined;
  */
  function initDateFilterElements () {
    initDateElements ();
    addFilterToggleListener ();
    createClearDatesButton ();
  }  

  /*
    Accepts no arguments; edits and attaches datepickers
    to the date input placeholders, and adds a reset button; 
    returns undefined.
  */
  function initDateElements () {
    getDateMinElement ().datepicker ()
      .attr ('placeholder', 'Start date')
      .change (startDateInputFunction);
    getDateMaxElement ().datepicker ()
      .attr ('placeholder', 'End date')
      .change (endDateInputFunction)
  }   

  /*
    Accepts no arguments, adds click listener to news
    filter button to toggle filter visibility, and
    returns undefined.
  */
  function addFilterToggleListener () {
    getFilterButton ().click ( function (e) {
      filterDisplayState === COLLAPSED ? expandFilter () : collapseFilter ();
    });    
  }

  /*
    Accepts no arguments; sets the value of dateInputState
    if necessary and submits the filter if both date fields 
    have input; returns either the new filter state or the 
    submit filter function.
  */
  function startDateInputFunction () {
    switch (dateInputState) {
      case ENDDATEINPUT:
        submitFilterForm ();
        return dateInputState = BOTHDATEINPUT;
      case BOTHDATEINPUT:
        return submitFilterForm ();
      case NODATEINPUT:
        getNewsFilterResetButton ().show ();
        return dateInputState = STARTDATEINPUT
      default:
        console.log('[news_landing][filterInputListener] Warning: unrecognized date input state "' + dateInputState + '".');
    }
  }  

  /*
    Accepts no arguments; sets the value of dateInputState
    if necessary and submits the filter if both date fields 
    have input; returns either the new filter state or the 
    submit filter function.
  */
  function endDateInputFunction () {
    switch (dateInputState) {
      case STARTDATEINPUT:
        submitFilterForm ();
        return dateInputState = BOTHDATEINPUT;
      case BOTHDATEINPUT:
        return submitFilterForm ();
      case NODATEINPUT:
        getNewsFilterResetButton ().show ();
        return dateInputState = ENDDATEINPUT
      default:
        console.log('[news_landing][filterInputListener] Warning: unrecognized date input state "' + dateInputState + '".');
    }
  }    

  /*
    Accepts no arguments, attaches the reset button with its
    click event, and returns undefined.
  */
  function createClearDatesButton () {
    getDateMaxElement ().after($('<div></div>')
      .attr ('class', getNewsFilterResetClassName ())
      .text ('Clear dates')
      .click (clearDates)
    );
  }

  /*
  */
  function clearDates () {
    getNewsFilterResetButton ().hide ();
    getDateMinElement ().val('')
    getDateMaxElement ().val('')
    if (dateInputState === BOTHDATEINPUT) {
      submitFilterForm ();
    }
    dateInputState = NODATEINPUT;
  }

  /*
    Accepts no arguments, adds the closed class to the filter
    button and removes the open class, and returns undefined.
  */
  function switchFilterButtonClassToClosed () {
    getFilterButton ().addClass (getNewsFilterClassPrefix () + '_closed')
      .removeClass (getNewsFilterClassPrefix () + '_open');
  }

  /*
    Accepts no arguments, adds the open class to the filter
    button and removes the closed class, and returns undefined.
  */
  function switchFilterButtonClassToOpen () {
    var classPrefix = getNewsFilterClassPrefix (); 
    getFilterButton ().addClass (getNewsFilterClassPrefix () + '_open')
      .removeClass (getNewsFilterClassPrefix () + '_closed');
  }

  /*
    Accepts no arguments, hides the filter forms, and
    returns undefined.
  */
  function hideFilter () {
    getFilterContainer ().hide ();
    switchFilterButtonClassToClosed ();
    filterDisplayState = COLLAPSED;
  }

  /*
    Accepts no arguments, displays the filter forms, and
    returns undefined.
  */
  function showFilter () {
    getFilterContainer ().show ();
    switchFilterButtonClassToOpen ();
    filterDisplayState = EXPANDED;
  }

  /*
    Accepts no arguments, animates the filter form down into
    view, and returns undefined.
  */
  function expandFilter () {
    getFilterContainer ().slideDown();
    switchFilterButtonClassToOpen ();
    filterDisplayState = EXPANDED;  
  }

  /*
    Accepts no arguments, animates the filter form up out of
    view, and returns undefined.
  */
  function collapseFilter () {
    getFilterContainer ().slideUp( function () {
      switchFilterButtonClassToClosed ();
      filterDisplayState = COLLAPSED;
    });  
  }  

  /*
    Accepts no arguments and submits this
    filter's view form by simulating a click on
    the form's submit button.
  */
  function submitFilterForm () {
    getSubmitButtonElement ().click ();
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the view form
    submit button.
  */
  function getSubmitButtonElement () {
    return $('.' + getSubmitClassName (), getFilterContainerSelectors ());
  }

  /*
    Accepts no arguments and returns a jQuery Element
    representing the news landing page's filter container.
  */
  function getFilterContainerSelectors () {
    console.log($('.' + getNewsLandingContainerClassName () + ' #' + getExposedFormID ()))
    return $('.' + getNewsLandingContainerClassName () + ' #' + getExposedFormID ());
  }    

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the minimum date input element.
  */
  function getDateMinElement () {
    return $('input[data-drupal-selector="edit-field-news-date-value-min"]');
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the maximum date input element.
  */
  function getDateMaxElement () {
    return $('input[data-drupal-selector="edit-field-news-date-value-max"]');
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the filter forms.
  */
  function getFilterContainer () {
    return $('.views-exposed-form');
  }  

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the display/hide filter button.
  */
  function getFilterButton () {
    return $('.' + getNewsFilterClassPrefix ());
  }  

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the news filter reset button.
  */
  function getNewsFilterResetButton () {
    return $('.' + getNewsFilterResetClassName ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the submmit button for the news filter.
  */
  function getFilterSubmitButton () {
    return $('#edit-submit-latest-news');
  }

  /*
    Accepts no arguments and returns a string that
    represents the class name of the news landing
    page container.
  */
  function getNewsLandingContainerClassName () {
    return 'news-landing-container';
  }

  /*
    Accepts no arguments and returns a string that
    represents the class name of the news filter 
    reset button.
  */
  function getNewsFilterResetClassName () {
    return getNewsFilterClassPrefix () + '_reset_button';
  }

  /*
    Accepts no arguments and returns a string representing
    the class name used to label the button that displays
    or hides the new filter.
  */
  function getNewsFilterClassPrefix () {
    return 'news_filter';
  }    

  /*
    Accepts no arguments and returns a string that
    represents the ID of the element that
    contains the filters.
  */
  function getExposedFormID () {
    return 'views-exposed-form-latest-news-news-landing';
  }  

  /*
    Accepts no arguments and returns a string
    that represents the view form button's
    class name.
  */
  function getSubmitClassName () {
    return 'js-form-submit';
  }  
 
}) (jQuery);