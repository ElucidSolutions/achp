/**
 @file
 Responsive behaviors for the BLM Theme.
*/
(function ($) {


  // Represents the header menu states.
  var HEADER_MENU_WIDESCREEN_DEFAULT_STATE = 0;
  var HEADER_MENU_WIDESCREEN_SEARCH_STATE = 1;
  var HEADER_MENU_WIDESCREEN_HOVER_STATE = 2;
  var HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE = 3;
  var HEADER_MENU_MOBILE_DEFAULT_STATE = 4;
  var HEADER_MENU_MOBILE_EXPANDED_STATE = 5;

  // Represents the current header state.
  var headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;

  $(document).ready (function () {
    // I Add expand/collapse click handler to subheader header.
    $('#subheader_mobile_header').click (function () {
      toggleSubheaderMenu ();
    });

    // II. Add a collapse click handler to the subheader close button.
    $('#subheader_mobile_close_button').click (function () {
      closeSubheaderMenu ();
    });

    // III. Display the subheader search 
    $('#header_menu_search_toggle_button').click (function () {
      toggleSearch ();
    });

    // IV. Handle subheader menu item hover events
    $('#header_menu li[data-menu-level="0"]').hover (
      // On mouse enter, show submenu
      function () {
        openWidescreenSubmenu ($('> ul', this).clone ());
      }, 
      // On mouse exit, hide submenu
      function () {
        closeWidescreenSubmenu ();
    });

    // V. Move the Search and Menu Block elements at breakpoints.
    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (min-width: 950px)').matches;
        },
        enter: function () {
          switch (headerMenuState) {
            case HEADER_MENU_MOBILE_DEFAULT_STATE:
              headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
              openHeaderMenu();
              closeMobileSubheaderHeader ();
              return closeMobileSubheader ();
            case HEADER_MENU_MOBILE_EXPANDED_STATE:
              openHeaderMenu();
              closeMobileSubheaderHeader ();
              closeMobileSubheader ();
              if (getSearchBlockElementValue () != '') {
                headerMenuState = HEADER_MENU_WIDESCREEN_SEARCH_STATE;
                moveSearchBlockToWidescreenSearch ();
                return openWidescreenSearch ();
              } else {
                return headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
              }
            case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
            case HEADER_MENU_WIDESCREEN_SEARCH_STATE:
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:               
            case HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE:  
              return openHeaderMenu();
            default:
              console.log('[achp_theme][document.ready] Warning: unrecognized header menu state "' + headerMenuState + '".');
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
          switch (headerMenuState) {
            case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
              headerMenuState = HEADER_MENU_MOBILE_DEFAULT_STATE;
              closeWidescreenSubheader ();
              closeHeaderMenu();
              openMobileSubheaderHeader ();
              return openMobileSubheader ();
            case HEADER_MENU_WIDESCREEN_SEARCH_STATE:
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:               
            case HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE:  
              headerMenuState = HEADER_MENU_MOBILE_EXPANDED_STATE;
              closeWidescreenSubheader ();
              closeHeaderMenu ();
              openMobileSubheaderHeader ();
              moveSearchBlockToMobileSearch ();
              return openMobileCollapsible ();
            case HEADER_MENU_MOBILE_DEFAULT_STATE:
            case HEADER_MENU_MOBILE_EXPANDED_STATE:
              return;
            default:
              console.log('[achp_theme][document.ready] Warning: unrecognized header menu state "' + headerMenuState + '".');
          }
        },
        exit: function () {
        }
      };
    })());
  });


  /*
  Accepts no arguments, shows the mobile subheader's header, and returns 
  undefined.
  */
  function openMobileSubheaderHeader () {
    $('#subheader_mobile_header').show ();
  }

  /*
  Accepts no arguments, hides the mobile subheader's header, and returns 
  undefined.
  */
  function closeMobileSubheaderHeader () {
    $('#subheader_mobile_header').hide ();
  }

  /* 
  Accepts no arguments, hides the header menu, and returns
  undefined.
  */
  function closeHeaderMenu () {
    $('#block-achp-main-menu').hide ();
  }

  /* 
  Accepts no arguments, shows the header menu, and returns
  undefined.
  */
  function openHeaderMenu () {
    $('#block-achp-main-menu').show ();
  }

  /*
    Accepts one argument: submenu, a jQuery HTML Element;
    displays submenu in the widescreen subheader menu
    element; and returns undefined.  
  */
  function openWidescreenSubmenu (submenu) {
    $('#subheader, #subheader_widescreen').show ();
    // TO DO: Maybe clone the submenu element instead of appending?
    $('#subheader_widescreen_submenu').empty ().append (submenu).slideDown ();
  }

  /*
    Accepts no arguments, hides the widescreen subheader menu,
    and returns undefined.  
  */
  function closeWidescreenSubmenu () {
    $('#subheader_widescreen_submenu').slideUp ().empty ();    
  }

  /*
  Accepts no arguments, closes widescreen subheader, and returns
  undefined.
  */
  function closeWidescreenSubheader() {
    $('#subheader_widescreen').hide ();
  }

  /*
  Accepts no arguments, opens widescreen subheader, and returns
  undefined.
  */
  function openMobileSubheader() {
    openMobileSubheaderHeader ();
    $('#subheader_mobile').show ();    
  }

  /*
  Accepts no arguments, opens widescreen collapsible, and returns
  undefined.
  */
  function openMobileCollapsible() {
    moveHeaderMenuToMobileBody ();
    openMobileSubheader ();
    $('#subheader_mobile_collapsible').slideDown ();
  }

  /*
  Accepts no arguments, closes widescreen collapsible, and returns
  undefined.
  */
  function closeMobileCollapsible() {
    // moveNavMenuToMobileBody ();
    // openMobileSubheader ();
    $('#subheader_mobile_collapsible').slideUp ();
  }


  /* 
  Accepts no arguments, toggles header menu search bar, 
  and returns undefined. 
  */
  function toggleSearch () {
    switch (headerMenuState) {
      case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
        headerMenuState = HEADER_MENU_WIDESCREEN_SEARCH_STATE;
        moveSearchBlockToWidescreenSearch ();
        return openWidescreenSearch ();
      case HEADER_MENU_WIDESCREEN_HOVER_STATE:
        headerMenuState = HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE;
        moveSearchBlockToWidescreenSearch ();
        return openWidescreenSearch ();
      case HEADER_MENU_WIDESCREEN_SEARCH_STATE:
        headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
        return closeWidescreenSearch ();
      case HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE:
        headerMenuState = HEADER_MENU_WIDESCREEN_HOVER_STATE;
        return closeWidescreenSearch ();
      case HEADER_MENU_MOBILE_DEFAULT_STATE:
      case HEADER_MENU_MOBILE_EXPANDED_STATE:
        return toggleSubheaderMenu();
      default:
        console.log('[achp_theme][toggleSearch] Warning: unrecognized header menu state "' + headerMenuState + '".');
    }
  }

  /* 
  Accepts no arguments, moves search block into widescreen search
  element, returns undefined.
  */
  function moveSearchBlockToWidescreenSearch () {
    $('#subheader_widescreen_search_bar').append (getSearchBlockElement ());
  }


  /*
  Accepts no arguments, displays search bar in widescreen, and
  returns undefined. 
  */
  function openWidescreenSearch () {
    $('#subheader, #subheader_widescreen').show ();
    $('#subheader_mobile').hide ();
    $('#subheader_widescreen_search_bar').slideDown ();
  }

  /* 
  Accepts no arguments, hides search bar in widescreen, and returns
  undefined.
  */
  function closeWidescreenSearch () {
    $('#subheader_widescreen_search_bar').slideUp ();
  }

  /*
  Accepts no arguments, handles click events for the close subheader 
  button, and returns undefined.
  */
  function closeSubheaderMenu () {
    switch (headerMenuState) {
      case HEADER_MENU_MOBILE_EXPANDED_STATE:
        headerMenuState = HEADER_MENU_MOBILE_DEFAULT_STATE;
        return closeMobileSubheader ();
      default:
        console.log('[achp_theme][closeSubheaderMenu] Warning: unrecognized header menu state "' + headerMenuState + '".');
    }
  }

  /*   
  Accepts no arguments, closes subheader, and returns undefined.
  */
  function closeMobileSubheader () {
    $('#subheader_mobile_collapsible').slideUp ();
  }

  /* 
  Accepts no arguments, handles click events for the subheader menu
  header, and returns undefined.
  */
  function toggleSubheaderMenu () {
    switch (headerMenuState) {
      case HEADER_MENU_MOBILE_EXPANDED_STATE:
        headerMenuState = HEADER_MENU_MOBILE_DEFAULT_STATE;
        // closeMobileSubheaderHeader ()
        return closeMobileSubheader ();
      case HEADER_MENU_MOBILE_DEFAULT_STATE:
        headerMenuState = HEADER_MENU_MOBILE_EXPANDED_STATE;
        moveSearchBlockToMobileSearch ();
        openMobileSubheaderHeader ();
        return openMobileCollapsible ();
      default:
        console.log('[achp_theme][toggleSubheaderMenu] Warning: unrecognized header menu state "' + headerMenuState + '".');
    }
  }

  /*
  Accepts no arguments, moves the navigation menu to mobile body element,
  and returns undefined.
  */
  function moveHeaderMenuToMobileBody () {
    // $('#subheader_mobile_body').append (getMenuBlockElement ());
    $('#subheader_mobile_body').empty();
    $('#block-achp-main-menu').clone ().appendTo($('#subheader_mobile_body'));
    $('#subheader_mobile_body').children($('#block-achp-main-menu')).show();
  }

  /*
  Accepts no arguments, moves search block to mobile search element,
  and returns undefined.
  */
  function moveSearchBlockToMobileSearch () {
    $('#subheader_mobile_search').append (getSearchBlockElement ());
  }

  /*
  Accepts no arguments, opens subheader, and returns undefined.
  */
  function openMobileSubheader () {
    $('#subheader').show ();
    $('#subheader_mobile').slideDown ();
  }

  /*
    Accepts no arguments and returns the Search Block element's 
    value as a string.
  */
  function getSearchBlockElementValue () {
    return $('.form-search', getSearchBlockElement ()).val ();
  }

  /*
    Accepts no arguments and returns the Search Block element as 
    a JQuery HTML Element.
  */
  function getSearchBlockElement () {
    return $('#block-achp-search');
  }

  /*
    Accepts no arguments and returns the subheader body element as 
    a JQuery HTML Element.
  */
  function getMenuBlockElement () {
    return $('#block-achp-main-menu');
  }
  
})(jQuery);