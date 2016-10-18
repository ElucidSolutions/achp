// Behavior for landing & individual news pages

(function ($) {

  var newsLandingBreakpoint = '850px';

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

    // I. Landing page behavior

    // Click listener for news filter button
    getFilterButton ().click ( function (e) {
      if (getFilterContainer ().css('display') === 'none') {
        getFilterContainer ().slideDown();
        switchFilterButtonClassToOpen ();
      } else {
        getFilterContainer ().slideUp( function () {
          switchFilterButtonClassToClosed ();
        });
      };
    });

  })

  /*
    Accepts no arguments, adds the closed class to the filter
    button and removes the open class, and returns undefined.
  */
  function switchFilterButtonClassToClosed () {
    var classPrefix = getNewsFilterClassPrefix ();
    getFilterButton ().removeClass (classPrefix + '_open').addClass (classPrefix + '_closed');
  }

  /*
    Accepts no arguments, adds the open class to the filter
    button and removes the closed class, and returns undefined.
  */
  function switchFilterButtonClassToOpen () {
    var classPrefix = getNewsFilterClassPrefix (); 
    getFilterButton ().removeClass (classPrefix + '_closed').addClass (classPrefix + '_open');
  }

  /*
    Accepts no arguments, hides the filter forms, and
    returns undefined.
  */
  function hideFilter () {
    getFilterContainer ().hide ();
    switchFilterButtonClassToClosed ();
  }

  /*
    Accepts no arguments, displays the filter forms, and
    returns undefined.
  */
  function showFilter () {
    getFilterContainer ().show ();
    switchFilterButtonClassToOpen ();
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
    return $('.' + getNewsFilterClassPrefix () + '');
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
 
})(jQuery);