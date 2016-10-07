// Behavior for landing & individual news pages

(function ($) {

  $(document).ready (function () {

    // I. Landing page behavior
    var newsLandingBreakpoint = '850px';

    // Displays filter options at widescreen; sets click listener at mobile
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

    // Attach datepicker to input areas
    $("#edit-date-min").datepicker ();
    $("#edit-date-max").datepicker ();

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

    // TEMPORARY: overwrites default values
    $("#edit-date-min").attr('value', 'Start date');
    $("#edit-date-max").attr('value', 'End date');
    $('#edit-submit-latest-news').attr('value', 'Submit');
  })

  /*
    Accepts no arguments and returns a string representing
    the class name used to label the button that displays
    or hides the new filter.
  */
  function getNewsFilterClassPrefix () {
    return 'news_filter';
  }

  /*
    Accepts no arguments and returns a jQuery HTML element
    that represents the filter forms.
  */
  function getFilterContainer () {
    return $('.views-exposed-form');
  }

  /*
    Accepts no arguments and returns a jQuery HTML element
    that represents the display/hide filter button.
  */
  function getFilterButton () {
    return $('.' + getNewsFilterClassPrefix () + '');
  }

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

  // II. Behaviors for individual news item page

  /*
    Accepts no arguments, hides the navigator if there are fewer
    than two images attached to the node, and positions the
    navigator previews correctly if there are more.
  */
  function positionImageNavCarousel () {
    console.log($('.field_news_photo').length);
    if ($('.field_news_photo').length < 2) {
      $('.navigator').hide();
    } else if ($('.field_news_photo').length === 3) {
      $('.navigator .gallery-cell').addClass('gallery-cell-thirds');
    } else if ($('.field_news_photo').length === 4) {
      $('.navigator .gallery-cell').addClass('gallery-cell-quarters');
    }
  }

  positionImageNavCarousel ();
 
})(jQuery);