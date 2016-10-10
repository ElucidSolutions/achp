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
    Accepts no arguments, hides the Flickity carousels if a 
    news story has no photos, hides just the navigation 
    carousel if a news story has only one photo, and 
    positions the navigation correctly if there are multiple
    photos.
  */
  function displayCarousels () {
    var navGalleryItem = $('.navigator .gallery-cell');

    switch ($('.field_news_photo').length) {
      case '0':
        $('#block-news-image-carousel').hide ();
        return $('#block-carousel-navigator').hide ();
      case 1:
        return $('.navigator').hide ();
      case 2:
       return  navGalleryItem.addClass ('gallery-cell-halves');
      case 3:
        return navGalleryItem.addClass ('gallery-cell-thirds');
      case 4:
        return navGalleryItem.addClass ('gallery-cell-quarters');
      default:
        console.log('[news.js] [displayCarousels] Unrecognized number of news photos: ' + $('.field_news_photo').length);
    }  
  }

  displayCarousels ();
 
})(jQuery);