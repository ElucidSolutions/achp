/* 
  Behavior for news landing page, excluding topic filter-specific
  behavior, which is located in view_term_list.js.
*/

(function ($) {

  var COLLAPSED = 'collapsed';
  var EXPANDED = 'expanded';
  var state = COLLAPSED;

  var newsLandingBreakpoint = '750px';

  Drupal.behaviors.news_landing = {
    attach: function (context, settings) {
      $(document).once ('news_landing').ajaxComplete (
        function (event, xhr, settings) {
          // initializes all of the filters on view updates.
          if (settings.url.indexOf ('/views/ajax') === 0) {
            // initializes the filter elements.          
            initDateFilterElements ();
            if (state === EXPANDED) {
              showFilter ();
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
    addFilterInputListener ();
  }  

  /*
    Accepts no arguments, adds click listener to news
    filter button to toggle filter visibility, and
    returns undefined.
  */
  function addFilterToggleListener () {
    getFilterButton ().click ( function (e) {
      state === COLLAPSED ? expandFilter () : collapseFilter ();
    });    
  }

  /*
    Accepts no arguments, attaches change event listeners 
    to the date inputs, and returns undefined.
  */
  function addFilterInputListener () {
    getDateMinElement ().change (submitFilterForm);
    getDateMaxElement ().change (submitFilterForm);
  }

  /*
    Accepts no arguments; edits and attaches datepickers
    to the date input placeholders, and adds a reset button; 
    returns undefined.
  */
  function initDateElements () {
    getDateMinElement ().datepicker ().attr('placeholder', 'Start date');
    getDateMaxElement ().datepicker ().attr('placeholder', 'End date')
      .after($('<div></div>')
        .append($('<input />')
          .attr('type', 'reset')
          .attr('value', 'Clear Dates')
          .attr('id', 'news_filter_reset')
          .click(function () {
            getDateMinElement ().attr('value', '');
            getDateMaxElement ().attr('value', '');
            submitFilterForm ();        
          })
      ));
  }  

  /*
    Accepts no arguments, adds the closed class to the filter
    button and removes the open class, and returns undefined.
  */
  function switchFilterButtonClassToClosed () {
    var classPrefix = getNewsFilterClassPrefix ();
    getFilterButton ().addClass (classPrefix + '_closed').removeClass (classPrefix + '_open');
  }

  /*
    Accepts no arguments, adds the open class to the filter
    button and removes the closed class, and returns undefined.
  */
  function switchFilterButtonClassToOpen () {
    var classPrefix = getNewsFilterClassPrefix (); 
    getFilterButton ().addClass (classPrefix + '_open').removeClass (classPrefix + '_closed');
  }

  /*
    Accepts no arguments, hides the filter forms, and
    returns undefined.
  */
  function hideFilter () {
    getFilterContainer ().hide ();
    switchFilterButtonClassToClosed ();
    state = COLLAPSED;
  }

  /*
    Accepts no arguments, displays the filter forms, and
    returns undefined.
  */
  function showFilter () {
    getFilterContainer ().show ();
    switchFilterButtonClassToOpen ();
    state = EXPANDED;
  }

  /*
    Accepts no arguments, animates the filter form down into
    view, and returns undefined.
  */
  function expandFilter () {
    getFilterContainer ().slideDown();
    switchFilterButtonClassToOpen ();
    state = EXPANDED;  
  }

  /*
    Accepts no arguments, animates the filter form up out of
    view, and returns undefined.
  */
  function collapseFilter () {
    getFilterContainer ().slideUp( function () {
      switchFilterButtonClassToClosed ();
      state = COLLAPSED;
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
    return $('.' + getNewsLandingContainerClassName () + ' .' + getExposedFormClassName ());
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
    that represents the submmit button for the news filter.
  */
  function getFilterSubmitButton () {
    return $('#edit-submit-latest-news');
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
    represents the class name of the news landing
    page container.
  */
  function getNewsLandingContainerClassName () {
    return 'news-landing-container';
  }

  /*
    Accepts no arguments and returns a string that
    represents the class name of the element that
    contains the filters.
  */
  function getExposedFormClassName () {
    return 'views-exposed-form';
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