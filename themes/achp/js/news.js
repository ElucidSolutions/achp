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

    setCarouselDisplay ();

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
    Accepts no arguments and returns a jQuery HTML Element
    that represents the main image carousel.
  */
  function getImageCarousel () {
    return $('#block-news-image-carousel');
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the navigator carousel.
  */
  function getNavCarousel () {
    return $('#block-carousel-navigator');
  }

  /*
    Accepts no arguments and returns an HTML Collection of
    the images associated with the story.
  */
  function getImageElements () {
    return $('.field_news_photo');
  }

  /*
    Accepts no arguments, hides the main image carousel,
    and returns undefined.
  */
  function hideImageCarousel () {
    getImageCarousel ().hide ();
  }

  /*
    Accepts no arguments, hides the navigator carousel,
    and returns undefined.
  */
  function hideNavCarousel () {
    getNavCarousel ().hide ();
  }

  /*
    Accepts no arguments and returns an Array representing
    the gallery items in the navigator carousel.
  */
  function getNavGalleryItems () {
    return getNavCarousel ().find('.gallery-cell').toArray ();
  }

  /*
    Accepts no arguments, sets the display for the two Flickity
    carousels, attaches a news-num-images attribute to each
    gallery item, and returns undefined.
  */
  function setCarouselDisplay () {
    var numImages = getImageElements ().length;
    var numImagesToDisplay;
    
    if (numImages > 4) { 
      numImagesToDisplay = 4; 
    } else {
      numImagesToDisplay = numImages;
    }
    getNavGalleryItems ().forEach (function (galleryItem) {
      $(galleryItem).attr ('news-num-images', numImagesToDisplay);
    })

    if (numImages === 0) {
      hideImageCarousel ();
      hideNavCarousel ();
    } else if (numImages === 1) {
      hideNavCarousel (); 
    }
  }
 
})(jQuery);