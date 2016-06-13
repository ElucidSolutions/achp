/**
 @file
 Responsive behaviors for the BLM Theme.
*/
(function ($) {


  // Represents the three header states.
  var SUBHEADER_DEFAULT_STATE = 0;
  var SUBHEADER_EXPANDED_STATE = 1;
  var SUBHEADER_SEARCH_STATE = 2;

  // Represents the current header state.
  var subheaderState = SUBHEADER_DEFAULT_STATE;

  $(document).ready (function () {
    // I Add expand/collapse click handler to subheader header.
    $('#subheader_header').click (function () {
        console.log('click1');
      toggleSubheader ();
    });

    // II. Add a collapse click handler to the subheader close button.
    $('#subheader_close_button').click (function () {
            console.log('click2');
      collapseSubheader ();
    });

    // III. Display the subheader search 
    $('#header_search_toggle_button').click (function () {
              console.log('click3');
      toggleSearch ();
    });

    // IV. Move the Search and Menu Block elements at breakpoints.
    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (min-width: 950px)').matches;
        },
        enter: function () {
          moveMenuToHeader ();
          moveSearchToSearchHeader ();
          showHeaderMenu ();
          collapseSubheader ();
          console.log('large screen bp entered')

          if (getSearchBlockElementValue () != '') {
            displaySearch ();
          }
        },
        exit: function () {
        }
      };
    })());

    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (max-width: 950px)').matches;
        },
        enter: function () {
          moveMenuToSubheader ();
          moveSearchToSubheader ();
          hideHeaderMenu ();
          console.log('small screen bp entered')


          if (subheaderState === SUBHEADER_SEARCH_STATE) {
            hideSearch ();
            expandSubheader ();
          }
        },
        exit: function () {
        }
      };
    })());
  });

/*
    Accepts no arguments, hides the header menu,
    and returns undefined.
  */
  function hideHeaderMenu () {
    $('#header_menu').hide ();
  }

  /*
    Accepts no arguments, displays the header
    menu by removing CSS added by JS, and
    returns undefined.
  */
  function showHeaderMenu () {
    $('#header_menu').removeAttr ('style');
  }

/*
    Accepts no arguments, moves the Search
    Block element into the subheader, and
    returns undefined.
  */
  function moveSearchToSubheader () {
    $('#subheader_search').append (getSearchBlockElement ());
  }

  /*
    Accepts no arguments, moves the Search
    Block element into the search header, and
    returns undefined.
  */
  function moveSearchToSearchHeader () {
    $('#header_search_region').append (getSearchBlockElement ());
  }

  /*
    Accepts no arguments and returns the Search
    Block element's value as a string.
  */
  function getSearchBlockElementValue () {
    return $('.form-search', getSearchBlockElement ()).val ();
  }

  /*
    Accepts no arguments and returns the Search
    Block element as a JQuery HTML Element.
  */
  function getSearchBlockElement () {
    return $('#block-achp-search');
  }

  /*
    Accepts no arguments, moves the Menu Block
    element into the subheader, and returns
    undefined.
  */
  function moveMenuToSubheader () {
    $('#subheader_menu').append (getMenuBlockElement ());
  }

  /*
    Accepts no arguments, moves the Menu Block
    element into the header menu region, and
    returns undefined.
  */
  function moveMenuToHeader () {
    $('#menu_region').append (getMenuBlockElement ());
  }

  /*
    Accepts no arguments and returns the Menu
    Block element as a JQuery HTML Element.
  */
  function getMenuBlockElement () {
    return $('#block-achp-main-menu');
  }

  /*
    Accepts no arguments, expands the subheader,
    and returns undefined.
  */
  function expandSubheader () {
    $('#subheader_search, #subheader_menu, #subheader_footer').show ();
    $('#subheader_collapsible').slideDown ();
    subheaderState = SUBHEADER_EXPANDED_STATE;
  }

  /*
    Accepts no arguments, collapses the subheader
    by removing any CSS attributes added by JS,
    and returns undefined.
  */
  function collapseSubheader () {
    $('#subheader_collapsible').slideUp (
      function () {
      $('#subheader_collapsible').removeAttr ('style');
    });
    subheaderState = SUBHEADER_DEFAULT_STATE;
  }

  /*
    Accepts no arguments, expands/collapses the
    subheader based on the current header state,
    and returns undefined.
  */
  function toggleSubheader () {
    switch (subheaderState) {
      case SUBHEADER_DEFAULT_STATE:
      case SUBHEADER_SEARCH_STATE:
        return expandSubheader ();
      case SUBHEADER_EXPANDED_STATE:
        return collapseSubheader ();
    }
  }

  /*
    Accepts no arguments, displays the search
    header, and returns undefined.
  */
  function displaySearch () {
    if (subheaderState === SUBHEADER_DEFAULT_STATE) {
      $('#header_search_region').slideDown ();
      subheaderState = SUBHEADER_SEARCH_STATE;
    }
  }

  /*
    Accepts no arguments, hides the search header
    by removing the CSS attributes added by JS,
    and returns undefined.
  */
  function hideSearch () {
    // debugger;
    if (subheaderState === SUBHEADER_SEARCH_STATE) {
      $('#header_search_region').slideUp (
        function () {
          $('#header_search_region').removeAttr ('style');
      });
      subheaderState = SUBHEADER_DEFAULT_STATE;
    }
  }

  /*
    Accepts no arguments, displays/hides the
    subheader based on the current header state,
    and returns undefined.
  */
  function toggleSearch () {
    switch (subheaderState) {
      case SUBHEADER_DEFAULT_STATE:
        return displaySearch ();
      case SUBHEADER_SEARCH_STATE:
        return hideSearch ();
    }
  }
  
})(jQuery);

