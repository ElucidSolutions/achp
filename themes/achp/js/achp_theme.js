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

    // I. Create mobile menu slide
    $('#subheader_mobile_body').append (createMenuSlides (getMenuList ()));

    // II. Add expand/collapse click handler to subheader header.
    $('#subheader_mobile_header').click (function () {
      toggleSubheaderMenu ();
    });

    // III. Add a collapse click handler to the subheader close button.
    $('#subheader_mobile_close_button').click (function () {
      closeSubheaderMenu ();
    });

    // IV. Display the subheader search 
    $('#header_menu_search_toggle_button').click (function () {
      toggleSearch ();
    });

    // // V. Handle subheader menu item hover events
    // $('#header_menu li[data-menu-level="0"]').hover (
    //   // On mouse enter, show submenu
    //   function () {
    //     openWidescreenSubmenu ($('> ul', this).clone ());
    //   }, 
    //   // On mouse exit, hide submenu
    //   function () {
    //     closeWidescreenSubmenu ();
    // });

    // For dev purposes
    $('#header_menu li[data-menu-level="0"]').click (function(e) {
      e.preventDefault();
      // $('> ul', this).show();
      var self = $(this);
      var topMenuItems = self.parent('ul').children();
      var clickedTopMenuItemIndex = self.attr('data-menu-item-index')

      $('#header_menu li[data-menu-level="0"]').removeClass('selected');
      $(this).addClass('selected');
      var submenu = ($('> ul', this).clone ());
      $('#header_dropdown_submenu').empty ().append (submenu).css ('display', 'inline-block').slideDown ();
      // for (var i = 0; i < topMenuItems.length; i++) {
      //   switch (clickedTopMenuItemIndex) {
      //     case ($(topMenuItems[0]).attr('data-menu-item-index')):
      //       console.log('item 0 selected');
      //       console.log(this);
      //       console.log(self);
      //       return;
      //     case ($(topMenuItems[1]).attr('data-menu-item-index')):
      //       console.log('item 1 selected');
      //       return;
      //     case ($(topMenuItems[2]).attr('data-menu-item-index')):
      //       console.log('item 2 selected');
      //       return;
      //     case ($(topMenuItems[3]).attr('data-menu-item-index')):
      //       console.log('item 3 selected');
      //       return;
      //     case ($(topMenuItems[4]).attr('data-menu-item-index')):
      //       console.log('item 4 selected');
      //       return;
      //     default:
      //       console.log('[achp_theme][document.ready] Warning: unrecognized top menu item selected');
      //   }
      // }
    });

    // VI. Handle subheader menu click events
    // $('#header_menu li[data-menu-level="0"]').click (function () {
    //   if (headerMenuState === HEADER_MENU_MOBILE_EXPANDED_STATE) {

    //   }
    // });

    // VII. Move the Search and Menu Block elements at breakpoints.
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
              closeWidescreenDropdownMenu ();
              openMobileSubheaderHeader ();
              return openMobileSubheader ();
            case HEADER_MENU_WIDESCREEN_SEARCH_STATE:
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:               
            case HEADER_MENU_WIDESCREEN_SEARCH_AND_HOVER_STATE:  
              headerMenuState = HEADER_MENU_MOBILE_EXPANDED_STATE;
              closeWidescreenSubheader ();
              closeHeaderMenu ();
              closeWidescreenDropdownMenu ();
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
    Accepts two arguments:

    * menuListItemIndex, an integer
    * and menuList, a jQuery HTML Element that
      represents a Drupal list of menu items.

    If menuList is a nested list, menuListItemIndex is the index of 
    menuList's parent. Otherwise menuListItemIndex should equal -1.

    Assigns a menu item index attribute to each
    list item in menuList, starting with
    menuListItemIndex; and returns an integer
    that represents the next available menu item
    index value.
  */
  function setMenuItemIndices (menuListItemIndex, menuList) {
    var parentIndex = menuListItemIndex;
    $('>li', menuList).each (function (i, menuListItem) {
      $(menuListItem).attr ('data-menu-item-index', ++menuListItemIndex)
                     .attr ('data-menu-item-parent-index', parentIndex);
      menuListItemIndex = setMenuItemIndices (menuListItemIndex, $('>ul', menuListItem));
    });
    return menuListItemIndex;
  }

  /*
  Accepts one argument: menuList, a jQuery HTML Element that
  represents a Drupal list of menu items; and returns a set of
  menu slide elements as a jQuery HTML Element.
  */
  function createMenuSlides (menuList) {
    setMenuItemIndices (0, menuList);
    var containerElement = $('<div></div>').addClass ('menu_slide_container');
    var menuListItems = $('>li', menuList);
    containerElement.append (createSlide(containerElement, 0, 'Table of Contents', menuListItems));
    menuListItems.each (function (i, menuListItem) {
      containerElement.append (createSubmenuSlides (menuList, containerElement, $(menuListItem)));
    });
    return containerElement;
  }

  /*
  Accepts one argument: menuListItem, a jQuery HTML Element that
  represents a single Drupal menu item; and returns an array of
  jQuery HTML elements that represents the item and all of its
  descendants.
  */
  function createSubmenuSlides (menuList, containerElement, menuListItem) {
    var index = $(menuListItem).attr('data-menu-item-index');
    var parentIndex = $(menuListItem).attr('data-menu-item-parent-index');
    var submenuListItems = $('>ul >li', menuListItem);
    var slides = [];

    // I. Create slide for menu list item
    var slide = createSlide (containerElement, index, $('>a', getMenuItem (menuList, index).clone ()), submenuListItems, parentIndex)
      .attr('data-menu-slide-parent-index', parentIndex);

      // II. Add menu list item slide to slides array
      slides.push (slide);

      // III. Create submenu slides
      submenuListItems.each (function (i, submenuListItem) {
        Array.prototype.push.apply (slides, createSubmenuSlides (menuList, containerElement, $(submenuListItem)));
      })

      return slides;
  }

  /*
  Accepts four arguments:

  * containerElement, a jQuery HTML Element representing the slide
    container
  * index, an integer representing the slide item index
  * titleElement, a jQuery HTML Element representing the slide title
  * menuListItems, a jQuery set of list items that represent menu items

  Returns a slide that has the given index, title element, and menu list 
  items as a jQuery HTML Element.
  */
  function createSlide (containerElement, index, titleElement, menuListItems, parentIndex) {
    var slideListItems = [];
    menuListItems.each (function (i, menuListItem) {
      slideListItems.push ($('>ul', menuListItem).length === 0 ?
        slideListItem = $(menuListItem).clone () :
        slideListItem = $('<li></li>')
          .addClass ('menu_slide_list_item')
          .html ($('>a', menuListItem).html ())
          .click (function () {
            showMenuSlide (containerElement, $(menuListItem).attr ('data-menu-item-index'));
            slide.hide ();
      }));
    });

    var slide = $('<div></div>')
      .addClass ('menu_slide')
      .attr('data-menu-slide-index', index)
      .append ($('<div></div>')
        .addClass ('menu_slide_header')
        .append ($('<div></div>')
          .addClass ('menu_slide_header_title')
          .append ($('<h3></h3>')
            .append (titleElement)))
        .append ($('<div></div>')
          .addClass ('menu_slide_header_back_button')
          .html ('Back')
          .click (function () {
            showMenuSlide (containerElement, parentIndex);
            slide.hide ();
          })
        ))
      .append ($('<div></div>')
        .addClass ('menu_slide_body')
        .append(menuListItems.length === 0 ? null : $('<ul></ul>').append (slideListItems)))
      .append ($('<div></div>')
        .addClass ('menu_slide_footer')
        .append ($('<div></div>')
          .addClass ('menu_slide_footer_close_button')
          .click (function () {
            closeSubheaderMenu ();
          })));


    if (slide.attr('data-menu-slide-index') === '0') {
      slide.find('.menu_slide_header_back_button').empty();
    }
  
      return slide;
  }

  /*
  Accepts two arguments: 

  * menuList, a jQuery HTML Element that represents a Drupal menu
    list element
  * and menuItemIndex, an integer that represents a menu item 
    index

  Returns the menu item in menuList that has menuItemIndex, as a
  jQuery HTML Element.
  */
  function getMenuItem (menuList, menuItemIndex) {
    return $('li[data-menu-item-index="' + menuItemIndex + '"]', menuList);
  }

  /*
  Accepts one argument: menuItemIndex, an integer; returns the referenced 
  menu slide element as a jQuery HTML Element.
  */
  function getMenuSlide (containerElement, menuItemIndex) {
    return $('div.menu_slide[data-menu-slide-index="' + menuItemIndex + '"]', containerElement);
  }


  /*
  Accepts one argument: menuItemIndex, an integer; shows the menu slide element with
  the given ID; and returns undefined;
  */
  function showMenuSlide (containerElement, menuItemIndex) {
    var slide = getMenuSlide (containerElement, menuItemIndex);
    slide.show();
  }

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
  Accepts no arguments, hides the widescreen header menu, and returns undefined.
  */
  function closeHeaderMenu () {
    $('#block-achp-main-menu').hide ();
  }

  /* 
  Accepts no arguments, shows the widescreen header menu, and returns undefined.
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
  function closeWidescreenSubheader () {
    $('#subheader_widescreen').hide ();
  }

  /*
  Accepts no arguments, closes the widescreen dropdown submenu, 
  and returns undefined.
  */
  function closeWidescreenDropdownMenu () {
    $('#header_dropdown_submenu').hide ();
    $('#header_menu li[data-menu-level="0"]').removeClass('selected');
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
    openMobileSubheader ();
    $('#subheader_mobile_collapsible').slideDown ();
  }

  /*
  Accepts no arguments, closes widescreen collapsible, and returns
  undefined.
  */
  function closeMobileCollapsible() {
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

  /*
  Accepts no arguments and returns the main menu list element as a 
  jQuery HTML Element.
  */
  function getMenuList () {
    return $('>ul', getMenuBlockElement ());
  }
  
})(jQuery);