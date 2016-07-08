/**
 @file
 Responsive behaviors for the ACHP Theme.
*/
(function ($) {


  // Represents the header menu states.
  var HEADER_MENU_WIDESCREEN_DEFAULT_STATE = 0;
  var HEADER_MENU_WIDESCREEN_HOVER_STATE = 1;
  var HEADER_MENU_MOBILE_DEFAULT_STATE = 2;
  var HEADER_MENU_MOBILE_EXPANDED_STATE = 3;

  // Represents the current header state.
  var headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;

  $(document).ready (function () {

    // Initialize display
    formatMenuHeaders ();
    setVerticalPositionHeader ();
    flexibility(document.documentElement);

    function hoverOnMobileMenu () {
      console.log('reached');
      console.log($('.menu_slide_list_item'));
      $('.menu_slide_list_item').append ('<span class="menu_slide_list_item_arrow"><object type="image/svg+xml" data="/themes/achp/images/right-arrow-icon.svg"></object></span>');

      $('.menu_slide_list_item').hover(
        function (e) {
          $(e.target).find($('.menu_slide_list_item_arrow')).html('<object type="image/svg+xml" data="/themes/achp/images/right-arrow-icon-blue.svg" class="menu_slide_list_item_arrow"></object>');
        },
        function (e) {
          $(e.target).find($('.menu_slide_list_item_arrow')).html('<object type="image/svg+xml" data="/themes/achp/images/right-arrow-icon.svg" class="menu_slide_list_item_arrow"></object>');
        })
    }

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
      openWidescreenSubmenu ($('> ul', this).clone ());
    });

    // VI. Handle subheader menu click events
    $('#header_menu li[data-menu-level="0"]').click (function () {
      if (headerMenuState === HEADER_MENU_MOBILE_EXPANDED_STATE) {
        toggleSubheaderMenu ();
      }
    });

    // VII. Move the Search and Menu Block elements at breakpoints.
    $.breakpoint ((function () {
      return {
        condition: function () {
          return window.matchMedia ('only screen and (min-width: 950px)').matches;
        },
        enter: function () {
          switch (headerMenuState) {
            case HEADER_MENU_MOBILE_DEFAULT_STATE:
              openHeaderMenu();
              closeMobileSubheaderHeader ();
              removeSelectedClassFromMenuItems ();
              closeMobileSubheader ();
              return headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
            case HEADER_MENU_MOBILE_EXPANDED_STATE:
              openHeaderMenu();
              closeMobileSubheaderHeader ();
              closeMobileSubheader ();
              moveSearchBlockToHeader ();
              removeSelectedClassFromMenuItems ();
              return headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
            case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:
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
              closeHeaderMenu ();
              closeWidescreenDropdownMenu ();
              openMobileSubheaderHeader ();
              return openMobileSubheader ();
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:               
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
    var nestedListItems = $('>li', menuList);
    menuList.attr ('data-menu-parent-index', parentIndex)
            .attr ('data-menu-num-children', nestedListItems.length);
    nestedListItems.each (function (i, menuListItem) {
      var nestedList = $('>ul', menuListItem);
      var numChildren = $('>li', nestedList).length;
      $(menuListItem).attr ('data-menu-item-index', ++menuListItemIndex)
                     .attr ('data-menu-item-local-index', i)
                     .attr ('data-menu-item-parent-index', parentIndex)
                     .attr ('data-menu-item-num-children', numChildren);
      menuListItemIndex = setMenuItemIndices (menuListItemIndex, nestedList);
    });
    return menuListItemIndex;
  }

  /*
  Accepts no arguments, returns undefined, and sets menu-num-columns and 
  menu-column-shift data attributes for the widescren dropdown menu
  element, which are used for its positioning.
  */
  // function setDropdownMenuOffsets () {
  //   var dropdownSubmenu = $('#subheader_widescreen_submenu_region #subheader_widescreen_submenu ul[data-menu-level="1"]');
  //   var numDropdownSubmenuColumns = $('>li', dropdownSubmenu).length;
  //   var parentIndex = dropdownSubmenu.attr ('data-menu-parent-index');
  //   var parentLocalIndex = $('#header_menu li[data-menu-level="0"][data-menu-item-index="' + parentIndex + '"]').attr ('data-menu-item-local-index');
  //   var numParentSiblings = $('#header_menu ul[data-menu-level="0"] > li[data-menu-level="0"]').length;
  //   var numParentSiblingsRemaining = numParentSiblings - parentLocalIndex;
  //   dropdownSubmenu
  //     .attr ('data-menu-num-columns', numParentSiblings)
  //     .attr ('data-menu-column-shift', 
  //       numDropdownSubmenuColumns <= numParentSiblingsRemaining ?
  //         parentLocalIndex : 
  //         parentLocalIndex - (numDropdownSubmenuColumns - numParentSiblingsRemaining)
  //     );
  // }

  /*
  Accepts no arguments, returns undefined, and removes the class 
  menu_selected from the top-level menu options.
  */
  function removeSelectedClassFromMenuItems () {
    $('#header_menu li[data-menu-level="0"]').removeClass('menu_selected');
  }

  /*
  Accepts one argument, submenu, a jQuery HTML Element; returns undefined; and 
  adds the class 'menu_selected'to the selected submenu and its parent menu item.
  */

  function selectDropdownMenuParent (submenu) {
    removeSelectedClassFromMenuItems ();
    $(submenu).addClass('menu_selected');
    var parentIndex = $(submenu).attr('data-menu-parent-index');
    $('li[data-menu-item-index="' + parentIndex + '"]').addClass('menu_selected');
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

      hoverOnMobileMenu ();

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
          })
          // .append ('<embed src="/themes/achp/images/right-arrow-icon.svg" type="" class="menu_slide_list_item_arrow">')
        );
    });

    // To remove line breaks from slide titles that have them
    if ($(titleElement).html() && $(titleElement).html().indexOf('<br>') >= 0) {
      removeMenuItemLineBreaks (titleElement);
    }

    var slide = $('<div></div>')
      .addClass ('menu_slide')
      .attr('data-menu-slide-index', index)
      .append ($('<div></div>')
        .addClass ('menu_slide_header')
        .append ($('<div></div>')
          .addClass ('menu_slide_header_title')
          .append ($('<div></div>')
            .addClass ('menu_slide_header_back_button')
            .html ('BACK')
            .click (function () {
              showMenuSlide (containerElement, parentIndex);
              slide.hide ();
            })
          )          
          .append ($('<h3></h3>')
            .append (titleElement)))
        )
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
      slide.find('.menu_slide_header_title').empty();
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
    // setHorizontalPositionHeader ();
    // setVerticalPositionHeader ();
    $('#block-achp-main-menu').show ();
    flexibility(document.documentElement);
  }

  /*
  Accepts no arguments, returns undefined, and horizontally
  centers header menu list.
  */
  // function setHorizontalPositionHeader () {
  //   var menuElement = $('#header_menu');
  //   var menuListElement = $('ul[data-menu-level="0"]', menuElement);
  //   var menuListItemsTotalWidth = Math.ceil ($('li[data-menu-level="0"]', menuElement).toArray ().reduce (
  //     function (totalWidth, menuItemElement) {
  //       return totalWidth + $(menuItemElement).outerWidth (true);
  //     }, 10)); // Setting initial value of 10 to account for borders being counted as part of content area
  //   var horizontalOffset = (menuElement.width () / 2) - (menuListElement.width () / 2);
  //   menuListElement.innerWidth (menuListItemsTotalWidth)
  //                  .css ('transform', 'translateX(' + horizontalOffset + 'px)');
  // }  

  /*
  Accepts no arguments, returns undefined, and vertically
  centers header menu list items.
  */
  function setVerticalPositionHeader () {
    var menuElement = $('#header_menu');
    var menuElementOffset = menuElement.height () / 2;
    $('li[data-menu-level="0"] > a', menuElement).each (function (i, menuItemElement) {
      menuItemElement = $(menuItemElement);
      var verticalOffset = menuElementOffset - (menuItemElement.height () / 2);
      menuItemElement.css ('transform', 'translateY(' + verticalOffset + 'px)')
    });
  }  

  /*
    Accepts one argument: submenu, a jQuery HTML Element;
    displays submenu in the widescreen subheader menu
    element; and returns undefined.  
  */
  function openWidescreenSubmenu (submenu) {
    $('#subheader, #subheader_widescreen').show ();
    $('#subheader_widescreen_submenu').empty ().append (submenu);
    setDropdownMenuOffsets ();
    selectDropdownMenuParent (submenu);
    alignSubmenuHeaders (); 
    $('#subheader_widescreen_submenu').slideDown ();
  }

  /*
  Accepts no arguments, returns undefined, and sets menu-num-columns and 
  menu-column-shift data attributes for the widescren dropdown menu
  element, which are used for its positioning.
  */
  function setDropdownMenuOffsets () {
    var dropdownSubmenu = $('#subheader_widescreen_submenu_region #subheader_widescreen_submenu ul[data-menu-level="1"]');
    var numDropdownSubmenuColumns = $('>li', dropdownSubmenu).length;
    var parentIndex = dropdownSubmenu.attr ('data-menu-parent-index');
    var headerMenuElement = $('#header_menu');
    var parentElement = $('li[data-menu-level="0"][data-menu-item-index="' + parentIndex + '"]', headerMenuElement);
    // var parentLocalIndex = $('#header_menu li[data-menu-level="0"][data-menu-item-index="' + parentIndex + '"]').attr ('data-menu-item-local-index');
    // var numParentSiblings = $('#header_menu ul[data-menu-level="0"] > li[data-menu-level="0"]').length;
    // var numParentSiblingsRemaining = numParentSiblings - parentLocalIndex;
    var parentElementOffset = parentElement.position ().left;
    var remainingWidth = headerMenuElement.width () - parentElementOffset;
    dropdownSubmenu
      .css ('left', 
        remainingWidth < dropdownSubmenu.width () ?
          parentElementOffset - (dropdownSubmenu.width () - remainingWidth) :
          parentElementOffset
      );
      // .attr ('data-menu-num-columns', numParentSiblings)
      // .attr ('data-menu-column-shift', 
      //   numDropdownSubmenuColumns <= numParentSiblingsRemaining ?
      //     parentLocalIndex : 
      //     parentLocalIndex - (numDropdownSubmenuColumns - numParentSiblingsRemaining)
      // );
  }

  /*
  Accepts no arguments, returns undefined, and sets the
  height for each submenu's header elements.
  */
  function alignSubmenuHeaders () {
    var submenuHeaders = $('#subheader_widescreen_submenu li[data-menu-level="1"] > a');
    var headerHeight = submenuHeaders.toArray ().reduce (function (headerHeight, submenuHeader) {
      return Math.max (headerHeight, $(submenuHeader).height ());
    }, 0);
    submenuHeaders.each (function (i, submenuHeader) {
      $(submenuHeader).css ('display', 'table-cell')
                      .css ('height', headerHeight)
                      .css ('vertical-align', 'bottom');
    })
  }

  /*
  Accepts no arguments, returns undefined, and inserts <br> tags
  into the header menu items so that they form two lines.
  */
  function formatMenuHeaders () {
    $('#header_menu li[data-menu-level="0"] > a').each (function (i, titleElement) {
      titleElement = $(titleElement);
      titleElement.html (formatMenuHeader (titleElement.html ()));
    });
  }

  /*
  Accepts one argument: title, a string; inserts <br> tags into title so
  that it spans two lines; and returns the result as a string. 
  */
  function formatMenuHeader (title) {
    return balanceLines ([[], title.split(' ')]).map (function (line) {
      return line.join (' ');
    }).join ('<br />');
  }

  /*
  Accepts one argument: lines, an array of string arrays that represent
  lines consisting of words; moves words between the lines so that they
  are balanced; and returns the resulting array.
  */
  function balanceLines (lines) {
    if (lines.length < 2) {
      return lines;
    }
    var firstLine = lines[0];
    var secondLine = lines[1];
    if (secondLine.length === 0) {
      return lines;
    }
    var word = secondLine[0];
    if (lineLength (firstLine) + word.length > lineLength (secondLine) - word.length) {
      return lines;
    }
    firstLine.push (secondLine.shift ());
    lines.shift ();
    lines = balanceLines (lines);
    lines.unshift (firstLine);
    return balanceLines (lines);
  }

  /*
  Accepts one argument: line, a string array where every string represents
  a word; and returns an integer representing the total number of characters
  in all the words.
  */
  function lineLength (line) {
    return line.reduce (function (length, word) {
      return length + word.length;
    }, 0);
  }

  /*
  Accepts no arguments, returns undefined, and filters the menu options
  on the first slide for any with line breaks.
  */
  function removeMenuHeaderLineBreaks () {
    $('.menu_slide[data-menu-slide-index="0"] .menu_slide_list_item').each 
      (function (i, titleElement) {
      titleElement = $(titleElement);
      if (titleElement.html().indexOf('<br>') >= 0) {
        removeMenuItemLineBreaks (titleElement);
      }
    })
  }

  /*
  Accepts one argument: an HTML Element representing a menu item with a 
  line break; returns the menu item with a space in place of the
  line break.  
  */
  function removeMenuItemLineBreaks (menuItem) {
    menuItem = $(menuItem);
    if (menuItem.html().indexOf('<br>') >= 0) {
      return menuItem.html(menuItem.html().replace('<br>', ' '));
    }
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
    removeMenuHeaderLineBreaks ()
    $('#subheader_mobile_collapsible').slideDown ();
  }

  function closeMobileCollapsible() {
    $('#subheader_mobile_collapsible').slideUp ();
  }


  /* 
  Accepts no arguments, toggles header menu search bar, 
  and returns undefined. 
  */
  function toggleSearch () {
    switch (headerMenuState) {
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
  function moveSearchBlockToHeader () {
    $('#header_widescreen_search_bar').append (getSearchBlockElement ());
    console.log('called')
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