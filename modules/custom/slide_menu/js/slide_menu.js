/*
  This module replaces those Drupal menu elements that have the
  "slide-menu-drupal-menu" class with slide menus elements.

  Note:

  This module uses a collection of HTML elements to represent
  slide menus. A diagram showing the relationships between these
  elements is given below:

  menu element
  +-------------------------------------------------------+
  | slide container element                               |
  | +---------------------------------------------------+ |
  | |  focus element                                    | |
  | |  +----------------------------------------------+ | |
  | |  |                                              | | |
  | |  +----------------------------------------------+ | |
  | |  slide element                                    | |
  | |  +----------------------------------------------+ | |
  | |  | item elements [] [] []                       | | |
  | |  +----------------------------------------------+ | |
  | +---------------------------------------------------+ |
  | slide left button element  slide right button element |
  | +--+                                             +--+ |
  | |  |                                             |  | |
  | +--+                                             +--+ |
  +-------------------------------------------------------+

  The focus and slide elements are absolutely positioned within
  the slide container element.

  The focus element defines the region that items items within the
  slide element are aligned with. By default, the slide element
  will align with the left edge of the focus element.

  If the menu item associated with the current page would lie outside
  of the focus element, however, the slide element is shifted to
  the left until the right edge of the menu item aligns with the
  right edge of the focus element.

  By default, the slide container element is the same width as the
  menu element.

  If the slide element is wider than the menu element, however, the
  slide element extends so that it can encompass the entire width
  of the slide element plus a margin to allow the slide element to
  be dragged so that the slide element's edges align with the menu
  element's edges.
*/
(function ($) {

  /*
    Finds those Drupal menu elements that have
    the "slide-menu-drupal-menu" class and
    replaces them with slide menus.
  */
  $(document).ready (function () {
    getDrupalMenuElements ().each (function (i, _drupalMenuElement) {
      var drupalMenuElement = $(_drupalMenuElement);

      var menu = new Menu (drupalMenuElement);
      drupalMenuElement.after (menu.element);
      menu.init ();
    });
  });

  // II. THE MENU CLASS

  /*
    Accepts one argument: drupalMenuElement,
    a jQuery HTML Element that represents a
    Drupal menu element; and returns a Menu
    object that represents drupalMenuElement.
  */
  function Menu (drupalMenuElement) {
    this.index = 0;
    this.itemElements = createMenuItemElements (this, drupalMenuElement);
    this.focusElement = createFocusElement ();
    this.slideLeftButtonElement = createMenuSlideLeftButtonElement (this);
    this.slideRightButtonElement = createMenuSlideRightButtonElement (this);
    this.slideElement = createMenuSlideElement (this.itemElements);
    this.slideContainerElement = createMenuSlideContainerElement (
      this.focusElement,
      this.slideElement
    );
    this.element = createMenuElement (
      this.slideContainerElement,
      this.slideLeftButtonElement, 
      this.slideRightButtonElement
    );
  }

  /*
    Accepts no arguments, resizes, positions,
    and enables/disables menu elements and
    returns undefined.
  */
  Menu.prototype.init = function () {
    var self = this;
    this.resizeSlideElement ();
    this.toggleSlideElement ();
    this.resizeSlideContainerElement ();
    this.centerSlideContainerElement ();
    this.resizeFocusElement ();
    this.centerFocusElement ();
    this.positionSlideElement ();
    this.focus ();
    this.initSlideButtons ();

    $(window).resize (function () {
      self.toggleSlideElement ();
      self.resizeSlideContainerElement ();
      self.centerSlideContainerElement ();
      self.resizeFocusElement ();
      self.centerFocusElement ();
      self.positionSlideElement ();
      self.focus ();
    });
  }

  /*
    Accepts no arguments, sets the show/hide
    functions for the slide buttons, and returns
    undefined.
  */
  Menu.prototype.initSlideButtons = function () {
    var self = this;
    window.setInterval (function () {
      self.shouldShowSlideLeftButton () ? self.showSlideLeftButton () : self.hideSlideLeftButton ();
      self.shouldShowSlideRightButton () ? self.showSlideRightButton () : self.hideSlideRightButton ();
    }, 1000);
  }

  /*
    Accepts no arguments, updates whether or
    not the slide element is draggable, and
    return undefined.

    Note: this function sets the slide element as
    draggable iff the slide element is clipped -
    I.E. the menu element is smaller than the
    slide element.
  */
  Menu.prototype.toggleSlideElement = function () {
    this.slideElement.draggable (
      this.slideElement.outerWidth () < this.element.width () ?
        'disable' : 'enable'
    );
  }

  /*
    Accepts no arguments, resizes the slide
    container element, and returns undefined.

    Note: By default, this function sets the
    slide container element so that it is the
    same width as the menu element. If, however,
    the slide element is wider than the menu
    element, this function extends the slide
    container element so that it can wrap the
    slide element plus a margin so that the
    slide element can be dragged to show all of
    its menu item elements.
  */
  Menu.prototype.resizeSlideContainerElement = function () {
    var slideWidth = this.slideElement.outerWidth ();
    var menuWidth = this.element.width ();

    return slideWidth < menuWidth ?
      this.slideContainerElement.width (menuWidth):
      this.slideContainerElement.width (2 * slideWidth - menuWidth);

  }

  /*
    Accepts no arguments, centers the slide
    container element within the menu element,
    and returns undefined.

    Note: this function assumes that the slide
    container element is absolutely positioned
    within the menu element.
  */
  Menu.prototype.centerSlideContainerElement = function () {
    this.slideContainerElement.css ('left',
      (this.element.width () - this.slideContainerElement.width ()) / 2);
  }

  /*
    Accepts no arguments, resizes the focus
    element, and returns undefined.

    Note: This function scales the focus element
    so that it spans the width of the menu
    element. This may be used in conjunction
    with a max-width property specified within
    a CSS stylesheet.
  */
  Menu.prototype.resizeFocusElement = function () {
    this.focusElement.width (this.element.width ());
  }

  /*
    Accepts no arguments, centers the focus
    element within the slide container element,
    and returns undefined.

    Note: This function assumes that the focus
    element is absolutely positioned within the
    slide container element.
  */
  Menu.prototype.centerFocusElement = function () {
    this.focusElement.css ('left',
      (this.slideContainerElement.width () - this.focusElement.width ()) / 2);
  }

  /*
    Accepts no arguments, resizes the slide
    element so that can fit all of its item
    elements; and returns undefined.
  */
  Menu.prototype.resizeSlideElement = function () {
    var slideWidth = this.itemElements.reduce (
      function (slideWidth, itemElement) {
        return slideWidth + $(itemElement).outerWidth ();
      }, 0
    );
    this.slideElement.width (slideWidth + 'px');
  }

  /*
    Accepts no arguments, aligns the slide
    element with the left-hand side of the focus
    element, and returns undefined.
  */
  Menu.prototype.positionSlideElement = function () {
    this.slideElement.css ('left', this.focusElement.position ().left);
  }

  /*
    Accepts no arguments, slides to the menu
    item that corresponds to the current page,
    and returns undefined.
  */
  Menu.prototype.focus = function () {
    var itemElement = this.getActiveItemElement ();
    itemElement && this.slideTo (getMenuItemElementIndex (itemElement));
  }

  /*
    Accepts one argument: index, an integer
    that references a menu item element; slides
    the slide element so that the menu item
    referenced by index is positioned within
    the focus element; and returns undefined.
  */
  Menu.prototype.slideTo = function (index) {
    var itemElement = this.getItemElement (index);
    var itemWidth = itemElement.width ();
    var itemLeft  = this.slideElement.position ().left + itemElement.position ().left;
    var itemRight = itemLeft + itemElement.width ();
    var focusLeft = this.focusElement.position ().left;
    var focusRight = focusLeft + this.focusElement.width ();

    if (itemLeft < focusLeft) {
      var delta = focusLeft - itemLeft;
      return this.slide (delta);
    } else if (itemRight > focusRight) {
      var delta = Math.max (focusLeft, focusRight - itemWidth) - itemLeft;
      return this.slide (delta);
    }
  }

  /*
    Accepts no arguments, slides the slide
    element to the right, and returns undefined.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element and that both
    are clipped by the menu element.
  */
  Menu.prototype.slideLeft = function () {
    this.slide (this.element.width ());
  }

  /*
    Accepts no arguments, slides the slide
    element to the left, and returns undefined.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element and that both
    are clipped by the menu element.
  */
  Menu.prototype.slideRight = function () {
    this.slide (-this.element.width ());
  }

  /*
    Accepts one argument: delta, an integer
    that represents an offset; slides the slide
    element to the right by delta pixels; and
    returns undefined.

    Note: delta may be a negative value, in this
    case, the slide element slides the slide
    element to the left.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element and that both
    are clipped by the menu element.
  */
  Menu.prototype.slide = function (delta) {
    this.slideElement.animate ({left: this.slideElement.position ().left + this.constrainDelta (delta)});
  }

  /*
    Accepts one argument: delta, an integer
    that represents a pixel offset; and returns
    an integer, delta' that represents a valid
    pixel offset for the slide element.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element and that both
    are clipped by the menu element.
  */
  Menu.prototype.constrainDelta = function (delta) {
    var left        = this.slideElement.position ().left;
    var right       = left + this.slideElement.width ();
    var rightMargin = this.slideContainerElement.width () - right;
    return left < -delta ? -left :
      (rightMargin < delta ? rightMargin : delta);
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the currently
    selected menu item element.
  */
  Menu.prototype.getSelectedItemElement = function () {
    return this.getItemElement (this.index);
  }

  /*
    Accepts one argument: index, a natural
    number that references a menu item element;
    and returns a jQuery HTML Element that
    represents the menu item element referenced
    by index.
  */
  Menu.prototype.getItemElement = function (index) {
    return index < this.itemElements.length ? this.itemElements [index] : null;
  }

  /*
    Accepts no arguments and returns a natural number
    that references the menu item that represents
    the current page.
  */
  Menu.prototype.getActiveItemElement = function () {
    return _.find (this.itemElements, menuItemElementIsActive);
  }

  /*
    Accepts no arguments, shows the slide left
    button, and returns undefined.
  */
  Menu.prototype.showSlideLeftButton = function () {
    this.slideLeftButtonElement.show ();
  }

  /*
    Accepts no arguments, shows the slide right
    button, and returns undefined.
  */
  Menu.prototype.showSlideRightButton = function () {
    this.slideRightButtonElement.show ();
  }

  /*
    Accepts no arguments, hides the slide left
    button, and returns undefined.
  */
  Menu.prototype.hideSlideLeftButton = function () {
    this.slideLeftButtonElement.hide ();
  }

  /*
    Accepts no arguments, hides the slide right
    button, and returns undefined.
  */
  Menu.prototype.hideSlideRightButton = function () {
    this.slideRightButtonElement.hide ();
  }

  /*
    Accepts no arguments and returns true iff
    the slide left button should be displayed.
  */
  Menu.prototype.shouldShowSlideLeftButton = function () {
    if (!this.isSlideContainerCropped ()) { return false; }

    var left = this.slideElement.position ().left;
    var right       = left + this.slideElement.width ();
    var rightMargin = this.slideContainerElement.width () - right;
    return rightMargin > 0;
  }

  /*
    Accepts no arguments and returns true iff
    the slide right button should be displayed.
  */
  Menu.prototype.shouldShowSlideRightButton = function () {
    if (!this.isSlideContainerCropped ()) { return false; }

    return this.slideElement.position ().left > 0;  
  }

  /*
    Accepts no arguments and returns true iff the
    slide container element has been cropped -
    I.E. the slide container element is wider
    than the menu element.
  */
  Menu.prototype.isSlideContainerCropped = function () {
    return this.element.width () < this.slideContainerElement.width ();
  }

  /*
    Accepts three arguments:

    * slideContainerElement, a jQuery HTML
      Element that represents a slide container
      element
    * slideLeftButtonElement, a jQuery HTML
      Element that represents a slide left button
      element
    * and slideRightButtonElement, a jQuery
      HTML Element that represents a slide right
      button element

    and returns a jQuery HTML Element that
    represents a menu element.
  */
  function createMenuElement (slideContainerElement, slideLeftButtonElement, slideRightButtonElement) {
    return $('<div></div>')
      .addClass (getMenuElementClassName ())
      .append (slideContainerElement)
      .append (slideLeftButtonElement)
      .append (slideRightButtonElement);
  }

  /*
    Accepts one argument: menu, a Menu object;
    and returns a jQuery HTML Element that
    represents a slide left button element.
  */
  function createMenuSlideLeftButtonElement (menu) {
    return createMenuSlideButtonElement ()
      .addClass (getMenuLeftSlideButtonElementClassName ())
      .click (function () { menu.slideLeft (); });
  }

  /*
    Accepts one argument: menu, a Menu object;
    and returns a jQuery HTML Element that
    represents a slide right button element.
  */
  function createMenuSlideRightButtonElement (menu) {
    return createMenuSlideButtonElement ()
      .addClass (getMenuRightSlideButtonElementClassName ())
      .click (function () { menu.slideRight (); });
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents an abstract
    slide button element.
  */
  function createMenuSlideButtonElement () {
    return $('<div></div>').addClass (getMenuSlideButtonElementClassName ());
  }

  /*
    Accepts two arguments:

    * focusElement, a jQuery HTML Element that
      represents a focus element
    * and slideElement, a jQuery HTML Element
      that represents a slide element

    and returns a jQuery HTML Element that
    represents a slide container element.
  */
  function createMenuSlideContainerElement (focusElement, slideElement) {
    return $('<div></div>')
      .addClass (getMenuSlideContainerElementClassName ())
      .append (focusElement)
      .append (slideElement);
  }

  /*
    Accepts one argument: itemElements, a jQuery
    HTML Element array that represents a set
    of menu item elements; and returns a jQuery
    HTML Element that represents a slide element
    containing itemElements.
  */
  function createMenuSlideElement (itemElements) {
    return $('<div></div>')
      .addClass (getMenuSlideElementClassName ())
      .append (itemElements)
      .draggable ({
        axis: 'x',
        containment: 'parent'
      });
  }

  /*
    Accepts two arguments:

    * menu, a Menu object
    * and drupalMenuElement, a jQuery HTML
      Element that represents a Drupal menu
      element

    and returns a jQuery HTML Element array
    representing a set of menu item elements
    that, in turn, represent the menu items
    in drupalMenuElement.
  */
  function createMenuItemElements (menu, drupalMenuElement) {
    return getDrupalMenuItemElements (drupalMenuElement).map (
      function (index, drupalMenuItemElement) {
        return createMenuItemElement (menu, index, $(drupalMenuItemElement));
    }).toArray ();
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a menu item
    element; and returns true iff itemElement
    represents the current page.
  */
  function menuItemElementIsActive (itemElement) {
    return itemElement.hasClass (getMenuItemElementActiveClassName ());
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a menu item
    element; and returns itemElement's index.
  */
  function getMenuItemElementIndex (itemElement) {
    return itemElement.attr (getMenuItemElementIndexAttribute ());
  }

  /*
    Accepts three arguments:

    * menu, a Menu object
    * index, a natural number
    * and drupalMenuItemElement, a jQuery HTML
      Element that represents a Drupal menu
      element

    and returns a jQuery HTML Element that
    represents a menu item element belonging
    to menu under index and representing
    drupalMenuItemElement.
  */
  function createMenuItemElement (menu, index, drupalMenuItemElement) {
    var linkElement = getDrupalMenuItemLinkElement (drupalMenuItemElement).clone ();
    linkElement.html (formatTitle (linkElement.html ()));

    return $('<div></div>')
      .addClass (getMenuItemElementClassName ())
      .addClass (drupalMenuItemElementIsActive (drupalMenuItemElement) ?
        getMenuItemElementActiveClassName () : null)
      .attr (getMenuItemElementIndexAttribute (), index)
      .append (linkElement)
      .focusin (function () { menu.slideTo (index); })
      .click (function () { menu.slideTo (index); });
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a focus element.
  */
  function createFocusElement () {
    return $('<div></div>').addClass (getMenuFocusElementClassName ());
  }

  /*
    Accepts one argument: drupalMenuItemElement,
    a jQuery HTML Element that represents a
    Drupal menu item element; and returns true
    iff drupalMenuItemElement represents a link
    to the current page.
  */
  function drupalMenuItemElementIsActive (drupalMenuItemElement) {
    return drupalMenuItemElement.hasClass (getDrupalMenuItemElementActiveClassName ());
  } 

  /*
    Accepts one argument: drupalMenuItemElement,
    a jQuery HTML Element that represents a
    Drupal menu item element; and returns
    a jQuery HTML Element that represents
    drupalMenuItemElement's link element.
  */
  function getDrupalMenuItemLinkElement (drupalMenuItemElement) {
    return $('> a', drupalMenuItemElement);
  }

  /*
    Accepts one argument: drupalMenuElement, a
    jQuery HTML Element that represents a Drupal
    menu; and returns a jQuery HTML Result Set
    that represents the Drupal menu items in
    drupalMenuElement.
  */
  function getDrupalMenuItemElements (drupalMenuElement) {
    return $('>li', drupalMenuElement);
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Result Set that represents the Drupal
    menu elements marked for replacement.
  */
  function getDrupalMenuElements () {
    return $('.' + getDrupalMenuElementClassName ());
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label slide elements.
  */
  function getMenuSlideElementClassName () {
    return getMenuElementClassName () + '-slide';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label slide container
    elements.
  */
  function getMenuSlideContainerElementClassName () {
    return getMenuElementClassName () + '-slide-container';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label left slide button
    elements.
  */
  function getMenuLeftSlideButtonElementClassName () {
    return getMenuElementClassName () + '-left-slide-button';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label right slide
    button elements.
  */
  function getMenuRightSlideButtonElementClassName () {
    return getMenuElementClassName () + '-right-slide-button';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label slide button
    elements.
  */
  function getMenuSlideButtonElementClassName () {
    return getMenuElementClassName () + '-slide-button';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label focus elements.
  */
  function getMenuFocusElementClassName () {
    return getMenuElementClassName () + '-focus';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label those menu
    item elements that link to the currently
    selected page.
  */
  function getMenuItemElementActiveClassName () {
    return getMenuItemElementClassName () + '-active';
  }

  /*
    Accepts no arguments and returns the name
    of the data attribute used to specify a menu
    item element's index.
  */
  function getMenuItemElementIndexAttribute () {
    return getMenuItemElementAttributePrefix () + '-index';
  }

  /*
    Accepts no arguments and returns the data
    attribute prefix used by menu item element
    attributes.
  */
  function getMenuItemElementAttributePrefix () {
    return getMenuElementAttributePrefix () + '-item';
  }

  /*
    Accepts no arguments and returns the name of
    the class used to label menu item elements.
  */
  function getMenuItemElementClassName () {
    return getMenuElementClassName () + '-item';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label menu elements.
  */
  function getMenuElementClassName () {
    return getModuleClassPrefix () + '-menu';
  }

  /*
    Accepts no arguments and returns the
    attribute prefix used by menu element
    attributes.
  */
  function getMenuElementAttributePrefix () {
    return getModuleAttributePrefix () + '-menu';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label Drupal menu items
    that link to the current page.
  */
  function getDrupalMenuItemElementActiveClassName () {
    return getModuleClassPrefix () + '-active';
  }

  /*
    Accepts no arguments and returns the name
    of the class used to label those Drupal
    menu elements that should be replaced by
    slide menus.
  */
  function getDrupalMenuElementClassName () {
    return getModuleClassPrefix () + '-drupal-menu';
  }

  /*
    Accepts no arguments and returns the class
    prefix used by all classes defined by
    this module.
  */
  function getModuleClassPrefix () {
    return 'slide-menu';
  }

  /*
    Accepts no arguments and returns the
    attribute prefix used by all of the data
    attributes created by this module.
  */
  function getModuleAttributePrefix () {
    return 'data-slide-menu';
  }

  // III. MISCELLANEOUS

  /*
  Accepts one argument: title, a string; inserts <br> tags into title so
  that it spans two lines; and returns the result as a string. 
  */
  function formatTitle (title) {
    var words = title.split (' ');
    if (words.length === 0) { return title; }

    var firstWord = words.shift ();
    return balanceLines ([[firstWord], words]).reduce (function (lines, line) {
      line.length > 0 && lines.push (line.join (' '));
      return lines;
    }, []).join ('<br />');
  }

  /*
    Accepts one argument: lines, an array of
    string arrays that represent lines consisting
    of words; moves words between the lines
    so that they are balanced; and returns the
    resulting array.
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
    Accepts one argument: line, a string array
    where every string represents a word; and
    returns an integer representing the total
    number of characters in all the words.
  */
  function lineLength (line) {
    return line.reduce (function (length, word) {
      return length + word.length;
    }, 0);
  }
}) (jQuery);
