// Behavior for news page

(function ($) {

  $(document).ready (function () {

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

    appendShareElement ();

  })

  function getNewsFilterClassPrefix () {
    return 'news_filter';
  }

  function getFilterContainer () {
    return $('.views-exposed-form');
  }

  function getFilterButton () {
    return $('.' + getNewsFilterClassPrefix () + '');
  }

  function switchFilterButtonClassToClosed () {
    var classPrefix = getNewsFilterClassPrefix ();
    getFilterButton ().removeClass (classPrefix + '_open').addClass (classPrefix + '_closed');
  }

  function switchFilterButtonClassToOpen () {
    var classPrefix = getNewsFilterClassPrefix (); 
    getFilterButton ().removeClass (classPrefix + '_closed').addClass (classPrefix + '_open');
  }

  function hideFilter () {
    getFilterContainer ().hide ();
    switchFilterButtonClassToClosed ();
  }

  function showFilter () {
    getFilterContainer ().show ();
    switchFilterButtonClassToOpen ();
  }

  /* 
  Accepts no arguments, attaches a click listener to the news 
  listener button, and returns undefined.
  */
  // function newsFilterClickListener () {
  //   $('.news_filter_closed').click (function (e) {
  //     getFilterContainer ().slideDown ();
  //     switchFilterButtonClassToOpen ();
  //   });

  //   $('.news_filter_open').click (function (e) {
  //     getFilterContainer ().slideUp ();
  //     switchFilterButtonClassToClosed ();
  //   });      
  // }

  /*
    Accepts two arguments:

    * name, a string
    * and url, a URL string

    gets the SVG file referenced by URL, caches
    the icon, and returns the file as an
    SVGDocument.
  */

  var SVG_ICONS = {};

  function getRawIcon (name, url) {
    if (!SVG_ICONS [name]) {
      $.ajax (url,
        {
          async: false,
          success: function (svgDocument) {
            SVG_ICONS [name] = svgDocument;
          },
          error: function () {
            console.log ('[section_106_map] Error: an error occured while trying to load a map icon.');
          }
      });
    }
    return SVG_ICONS [name] ? (SVG_ICONS [name]).cloneNode (true) : null;
  }

  /*
    Accepts no arguments and returns an HTML element that 
    contains multiple sharing options for the current URL
    as a JQuery HTML Element.

    Note: This function displays 
    elements created by the AddToAny
    (https://www.drupal.org/project/addtoany)
    module.
  */  

  function createShareElement () {
    var classPrefix = 'news_item_share';
    var url = window.location.href;
    var title = $('.news_item .field_short_title').text();

    return ($('<div></div>')
      .addClass (classPrefix + '_buttons')
      .addClass ('a2a_kit a2a_kit_size_32 a2a_default_style')
      .attr ('data-a2a-url', url)
      .attr ('data-a2a-title', title)
      .append($('<div></div>')
        .addClass (classPrefix + '_button')
        .addClass (classPrefix + '_facebook')
        .append ($('<a></a>')
          .addClass ('a2a_button_facebook')
          .addClass (classPrefix + '_link')
          .append ($(getRawIcon ('facebook-icon', '/modules/custom/section_106_map/images/facebook-icon.svg').documentElement)
            .addClass (classPrefix + '_icon')
            .addClass (classPrefix + '_facebook_icon'))))
        .append ($('<div></div>')
          .addClass (classPrefix + '_button')
          .addClass (classPrefix + '_twitter')
          .append ($('<a></a>')
            .addClass ('a2a_button_twitter')
            .addClass (classPrefix + '_link')
            .append ($(getRawIcon ('twitter-icon', '/modules/custom/section_106_map/images/twitter-icon.svg').documentElement)
              .addClass (classPrefix + '_icon')
              .addClass (classPrefix + '_twitter_icon'))))
        .append ($('<div></div>')
          .addClass (classPrefix + '_button')
          .addClass (classPrefix + '_mail')
          .append ($('<a></a>')
            .addClass (classPrefix + '_mail_link')
            .addClass (classPrefix + '_link')
            .attr ('href', 'mailto:?subject=Take%20a%20look%20at%20this%20&body=Take%20a%20look%20at%20this%20%3A%0A%0A' + url)
            .append ($(getRawIcon ('email-icon', '/modules/custom/section_106_map/images/email-icon.svg').documentElement)
              .addClass (classPrefix + '_icon')
              .addClass (classPrefix + '_mail_icon'))))
        .append ($('<div></div>')
          .addClass (classPrefix + '_button')
          .addClass (classPrefix + '_link')
          .attr ('data-clipboard-text', url) // Uses clipboard.js to copy URLS to clipboards.
          .append ($(getRawIcon ('link-icon', '/modules/custom/section_106_map/images/link-icon.svg').documentElement)
            .addClass (classPrefix + '_icon')
            .addClass (classPrefix + '_link_icon'))));
  }

  /*
    Accepts no arguments, appends the Share element 
    to its parent div, and returns undefined.
  */
  function appendShareElement () {
    $('.news_item_share').append (createShareElement ());
  }

})(jQuery);