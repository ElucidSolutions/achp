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

    // I. Create mobile menu slide
    $('#subheader_mobile_body').append (createMenuSlides (getMenuList ()));

    // II. Add expand/collapse click handler to subheader header.
    $('#subheader_mobile_header')
      .attr ('tabindex', 0)
      .keydown (function (event) {
        // toggle the mobile menu when the user presses Enter over it.
        if (event.which === 13) {
          toggleSubheaderMenu ();
        }
      })
      .click (function () {
        toggleSubheaderMenu ();
      });

    // III. Add a collapse click handler to the subheader close button.
    $('#subheader_mobile_close_button').click (function () {
      closeSubheaderMenu ();
    });

    $('#subheader_mobile_close_button1').click (function () {
      closeSubheaderMenu ();
    });

    // IV. Display the subheader search 
    $('#header_menu_search_toggle_button').click (function () {
      toggleSearch ();
    });

    // V. Handle subheader menu item hover events
    $('#header_menu li[data-menu-level="0"]')
      .keydown (function (event) {
        if (event.which === 13) {
          if ($(this).hasClass ('menu_selected')) { 
            closeWidescreenSubmenu ();
          } else {
            // open this item's drop-down when the user presses Enter over it.
            event.stopPropagation ();
            closeWidescreenSubmenu ();
            openWidescreenSubmenu ($('> ul', this).clone ());
          }
        } else if (event.which === 9) {
          // close this item's drop-down if the user tabs out of it. 
          console.log ('[achp_theme] Tabbed within a header menu item.');
        }
      })
      .hover (
        // When mouse hovers on menu, show drop-down submenu
        function () {
          openWidescreenSubmenu ($('> ul', this).clone ());
        },
        // When mouse leaves, listen to see if it has gone to the drop-down or not 
        function () {       
          $('ul[data-menu-level="1"]').hover (
            function () {
              // If yes, keep submenu open and do nothing
            }, function () {
              // If no, close submenu
              closeWidescreenSubmenu ();
            })
        }
      )

    // Continuation of part V: edge cases that should close submenu
    $('#header').mouseover ( 
      function () {
        closeWidescreenSubmenu ();
      })

    $('#homepage_hero_region').mouseover ( 
      function () {
        closeWidescreenSubmenu ();
      })

    // Remove default text from superimposing onto search icon
    emptySearchInputValue ();

    // // For dev purposes
    // $('#header_menu li[data-menu-level="0"]').click (function(e) {
    //   e.preventDefault();
    //   openWidescreenSubmenu ($('> ul', this).clone ());
    // });

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
          return window.matchMedia ('only screen and (min-width: 1150px)').matches;
        },
        enter: function () {
          switch (headerMenuState) {
            case HEADER_MENU_MOBILE_DEFAULT_STATE:
              openHeaderMenu ();
              closeMobileSubheaderHeader ();
              removeSelectedClassFromMenuItems ();
              moveSearchBlockToHeader ();
              closeMobileSubheader ();
              return headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
            case HEADER_MENU_MOBILE_EXPANDED_STATE:
              openHeaderMenu ();
              closeMobileSubheaderHeader ();
              closeMobileSubheader ();
              moveSearchBlockToHeader ();
              removeSelectedClassFromMenuItems ();
              return headerMenuState = HEADER_MENU_WIDESCREEN_DEFAULT_STATE;
            case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
            case HEADER_MENU_WIDESCREEN_HOVER_STATE:
              return openHeaderMenu ();
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
          return window.matchMedia ('only screen and (max-width: 1150px)').matches;
        },
        enter: function () {
          switch (headerMenuState) {
            case HEADER_MENU_WIDESCREEN_DEFAULT_STATE:
              headerMenuState = HEADER_MENU_MOBILE_DEFAULT_STATE;
              closeWidescreenSubheader ();
              closeHeaderMenu ();
              closeWidescreenDropdownMenu ();
              openMobileSubheaderHeader ();
              moveSearchBlockToMobileSearch ();
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

    // Initialize the search bar.
    initHeaderSearch ();
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

      numChildren > 0 ?
        $('>a', menuListItem).replaceWith (
          $('<span></span>')
            .html ($('>a', menuListItem).html ())
            .attr ('tabindex', menuListItemIndex)
            // .attr ('tabindex', 0)
        ):
        $('>a', menuListItem).attr ('tabindex', menuListItemIndex);
        // $('>a', menuListItem).attr ('tabindex', 0);

      menuListItemIndex = setMenuItemIndices (menuListItemIndex, nestedList);
    });
    return menuListItemIndex;
  }

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
    var slide = createSlide (containerElement, index, $('>a, >span', getMenuItem (menuList, index).clone ()), submenuListItems, parentIndex)
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
      menuListItem = $(menuListItem).clone (true);
      $('>a, >span', menuListItem).attr ('tabindex', 0);
      slideListItems.push ($('>ul', menuListItem).length === 0 ? 
        slideListItem = menuListItem :
        slideListItem = $('<li></li>')
          .addClass ('menu_slide_list_item')
          .html ($('>a, >span', menuListItem).html ())
          .attr ('tabindex', 0)
          .keydown (function (event) {
            // slideTo the submenu's slide when the user presses "Enter". 
            if (event.which === 13) {
              slideOutToLeft (index);            
              slideInFromRight (containerElement, $(menuListItem).attr ('data-menu-item-index'));
            }
          })
          .click (function () {
            slideOutToLeft (index);            
            slideInFromRight (containerElement, $(menuListItem).attr ('data-menu-item-index'));
          })
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
            .attr ('tabindex', 0)
            .html ('BACK')
            .keydown (function (event) {
              // go back if the user presses enter while focusing on the back button.
              if (event.which === 13) {
                slideInFromLeft (containerElement, parentIndex);  
                slideOutToRight (index);
              }  
            })
            .click (function () {     
              slideInFromLeft (containerElement, parentIndex);  
              slideOutToRight (index);                            
            })
          )          
          .append ($('<h3></h3>')
            .append ($(titleElement).html() ? $(titleElement).html() : titleElement)))
        )
      .append ($('<div></div>')
        .addClass ('menu_slide_body')
        .append(menuListItems.length === 0 ? null : $('<ul></ul>').append (slideListItems)))
      .append ($('<div></div>')
        .addClass ('menu_slide_footer')
        );

    /* Special conditions for highest-level slide: empties Back button and
    title; positions Close button */
    if (slide.attr('data-menu-slide-index') === '0') {
      slide.find('.menu_slide_header_back_button').empty();
      slide.find('.menu_slide_header_title').empty();
      appendExtraMenuItems(slide);
    }
  
    return slide;
  }

  /*
  Accepts one argument, an HTML Element; appends blue and grey arrow icons to the 
  element, toggling between them upon hover; and returns undefined.
  */

  // function toggleArrows (item) {
  //   $(item).append ($('<span></span>')
  //            .addClass('arrow')
  //            .html ('<embed src="/themes/achp/images/right-arrow-icon.svg" />')
  //          )   
  //          .append ($('<span></span>')
  //            .addClass('arrow_blue')
  //            .html ('<embed src="/themes/achp/images/right-arrow-icon-blue.svg" />')
  //          )       
  //          .hover (
  //            function (e) {
  //              $('.arrow_blue', $(e.target)).css ('z-index', '1000');
  //            },
  //            function (e) {
  //              $('.arrow_blue', $(e.target)).css ('z-index', '800');
  //         });
  // }

  /*
  Accepts one argument: slide, an object representing a single 
  menu screen; attaches additional list items to the screen;
  and returns undefined.
  */

  function appendExtraMenuItems(slide) {
    slide = $(slide);
    slide.find('.menu_slide_body')
         .append($('<ul></ul>')
           .addClass('menu_slide_extras')
           .append ($('<li></li>')
             .addClass ('menu_slide_extra_item')
             .html ('<a href="/contact/feedback">CONTACT US</a>'))
           .append ($('<li></li>')
             .addClass ('menu_slide_extra_item')
             .html (drupalSettings.user.uid === 0 ?
               ('<a href="/user/login">SIGN IN</a>') :
               ('<a href="/user/logout">SIGN OUT</a>')
             ))
          );
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
  Accepts two arguments: 
  * menuItemIndex, an integer
  * containerElement, a jQuery HTML Element representing the slide 

  Animates the slide into view and returns undefined.
  */
  function slideInFromLeft (containerElement, menuItemIndex) {
    var slide = getMenuSlide (containerElement, menuItemIndex);
    slide.css ('right', '100vw')
         .delay (0) /* This seems to fix a Safari bug */
         .animate ({ right: '0', left: '0' }, 250, "linear")     
         .show ();

    // $('li > a, .menu_slide_list_item', slide).first ().focus ();

    animateSubheaderHeight (setSubheaderHeight (slide));
  }

  /*
  Accepts two arguments: 
  * menuItemIndex, an integer
  * containerElement, a jQuery HTML Element representing the slide 

  Animates the slide into view and returns undefined.
  */
  function slideInFromRight (containerElement, menuItemIndex) {
    var slide = getMenuSlide (containerElement, menuItemIndex);
    slide.css ('left', '100vw')
         .delay (0) /* This seems to fix a Safari bug */
         .animate ({ left: '0', right: '0' }, 250, "linear")
         .show ();

    // $('li > a, .menu_slide_list_item', slide).first ().focus ();

    animateSubheaderHeight (setSubheaderHeight (slide));
  }

  /*
  Accepts one argument: slide, an object representing a single 
  menu screen; returns a string representing the height of 
  that slide's subheader element.
  */
  function setSubheaderHeight (slide) {
    var subheaderHeight = $('.search-block-form').height () + $('.menu_slide_header').height () + slide.height () + 81;
    subheaderHeight += 'px';
    return subheaderHeight;    
  }

  /*
  Accepts one argument: subheaderHeight, a string; animates
  the subheader height to that height; and returns undefined.
  */
  function animateSubheaderHeight (subheaderHeight) {
    $('#subheader_mobile_collapsible').animate ({height: subheaderHeight}, 250);    
  }

  /*
  Accepts one argument: index, an integer; animates the slide with 
  that index out of view; and returns undefined.
  */
  function slideOutToLeft (index) {
    $('.menu_slide[data-menu-slide-index="' + index + '"]')
      .animate({ left: '-100vw' }, 250, "linear",
        function () {
          $(this).hide ();
        });

  }

  /*
  Accepts one argument: index, an integer; animates the slide with 
  that index out of view; and returns undefined.
  */
  function slideOutToRight (index) {
    $('.menu_slide[data-menu-slide-index="' + index + '"]')
      .animate({ left: '100vw' }, 250, "linear",
        function () {
          $(this).hide ();
        });
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
    var parentElementOffset = parentElement.position ().left;
    var remainingWidth = headerMenuElement.width () - parentElementOffset - 110;
    // 110 allows for the 55px padding on each side
    dropdownSubmenu
      .css ('left', 
        remainingWidth < dropdownSubmenu.width () ?
          parentElementOffset - (dropdownSubmenu.width () - remainingWidth) :
          parentElementOffset
      );
  }

  /*
  Accepts no arguments, returns undefined, and sets the
  height for each submenu's header elements.
  */
  function alignSubmenuHeaders () {
    var submenuHeaders = $('#subheader_widescreen_submenu li[data-menu-level="1"] > span');
    var submenuLineHeight = parseInt(submenuHeaders.css('line-height'));
    var headerHeight = submenuHeaders.toArray ().reduce (function (headerHeight, submenuHeader) {
      var numLines = Math.ceil ($(submenuHeader).height () / submenuLineHeight);
      return Math.max (headerHeight, numLines * submenuLineHeight);
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
    $('#subheader_widescreen_submenu').empty ();
    removeSelectedClassFromMenuItems ();
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
    removeMenuHeaderLineBreaks ();
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
    Accepts no arguments, empties the value attribute of the
    search input button, and returns undefined.
  */
  function emptySearchInputValue () {
    getSearchBlockElement().find($('input')).attr('value', '');
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
    return $('#block-header-search-filter');
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

  /* 
    Accepts no arguments and returns undefined.
  */
    function initHeaderSearch () {
      setHeaderSearchPlaceholder ();
      removeSubmitButtonText ();
    }


  /*
    Accepts no arguments, sets placeholder text on the header search
    element, and returns undefined.
  */
  function setHeaderSearchPlaceholder () {
    getHeaderSearchElement ().attr('placeholder', 'SEARCH ACHP.GOV');
  }

  /*
    Accepts no arguments, removes default text from the submit
    button, and returns undefined.
  */
  function removeSubmitButtonText () {
    getHeaderSearchSubmitButton ().attr('value', '');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the view form
    submit button.
  */
  function getHeaderSearchSubmitButton () {
    return getSearchContainerElement ().find (getSearchSubmitButton ());
  }

  /*
    Accepts no arguments and returns a string representing
    the search input field selector.
  */
  function getSearchSelector () {
    return 'input#edit-keys';
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the text
    input field.
  */
  function getHeaderSearchElement () {
    return getSearchContainerElement ().find (getSearchSelector ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the header search submit button.
  */
  function getSearchSubmitButton () {
    return getSearchContainerElement ().find (getSearchSubmitSelector ());
  }

  /*
    Accepts no arguments and returns a string representing
    the search submit button selector.
  */
  function getSearchSubmitSelector () {
    return 'input#edit-submit-search';
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    representing the header search container element.
  */
  function getSearchContainerElement () {
    return $('#' + getSearchContainerID ());
  }

  /*
    Accepts no arguments and reutrns a string representing
    the header search container ID.
  */
  function getSearchContainerID () {
    return 'block-header-search-filter';
  }
})(jQuery);
