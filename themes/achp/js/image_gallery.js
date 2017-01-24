/*
  This module overrides some of the default
  behavior of Flickity based slideshows, which
  are used by the ACHP Image Gallery feature.

  Note: This module uses Object Fit Images
  (https://github.com/bfred-it/object-fit-images/)
  to scale images using the object-fit CSS property.
*/
(function ($) {

  /*
    An integer that specifies the minimum
    number of images that must be displayed in
    a Flickity element for a navigator to appear.
  */
  function MIN_NUM_IMAGES () { return 2; }

  // I. Flickity Instances

  /*
    Creates the navigator elements and
    initializes the flickity instances when the
    page loads.
  */
  $(document).ready (function () {
    getFlickityInstances ().forEach (
      function (flickity) {
        // create the navigator instance.
        var navigator = new Navigator (flickity);

        if (navigator.itemElements.length >= MIN_NUM_IMAGES ()) {
          // attach the navigator element.
          getFlickityElement (flickity).append (navigator.element);

          // initialize the navigator instance.
          navigator.init ();
        }
    });
  });

  // II. Navigator Instances

  /*
    Accepts one arguments: flickity, a Flickity
    instance; and returns a Navigator object
    that represents a navigator instance tied
    to flickity.
  */
  function Navigator (flickity) {
    this.flickity = flickity;
    this.itemElements = createItemElements (this);
    this.slideLeftButtonElement = createSlideLeftButtonElement (this);
    this.slideRightButtonElement = createSlideRightButtonElement (this);
    this.slideElement = createSlideElement (this.itemElements);
    this.slideContainerElement = createSlideContainerElement (this.slideElement);
    this.element = createNavigatorElement (
      this.slideContainerElement,
      this.slideLeftButtonElement,
      this.slideRightButtonElement
    );
  }

  /*
    Accepts no arguments and initializes this
    navigator instance.
  */
  Navigator.prototype.init = function () {
    var self = this;
    this.scaleSlideElement ();
    this.scaleSlideContainerElement ();
    this.scaleImages ();
    this.centerSlideContainerElement ();
    this.positionSlideElement ();
    this.initSlideButtons ();

    this.flickity.on ('select', function () {
      self.slideTo (self.flickity.selectedIndex);
    });

    $(window).resize (function () {
      self.scaleSlideElement ();
      self.scaleSlideContainerElement ();
      self.scaleImages ();
      self.centerSlideContainerElement ();
      self.positionSlideElement ();
      self.toggleButtons ();
    });
  }

  /*
    Accepts no arguments, sets the show/hide
    functions for the slide buttons, and returns
    undefined.
  */
  Navigator.prototype.initSlideButtons = function () {
    var self = this;
    this.toggleButtons ();
    this.updateButtons ();
    window.setInterval (function () {
      self.updateButtons ();
    }, 1000);
  }

 /*
    Accepts no arguments, scales the slide
    element so that it can fit all of its item
    elements; and returns undefined.
  */
  Navigator.prototype.scaleSlideElement = function () {
    var slideWidth = this.itemElements.reduce (
      function (slideWidth, itemElement) {
        return slideWidth + $(itemElement).outerWidth (true);
      }, 0
    );
    this.slideElement.width (slideWidth + 'px');
  }

  /*
    Accepts no arguments, scales the slide
    container element so that it can contain the
    slide element and its overflow w.r.t. this
    instance's element; and returns undefined.
  */
  Navigator.prototype.scaleSlideContainerElement = function () {
    var margin = Math.max (0, this.slideElement.width () - this.element.width ());
    this.slideContainerElement.width (this.slideElement.width () + margin);
  }

  /*
    Accepts no arguments, centers the slide
    container element within this instance's
    element, and returns undefined.

    Note: this function assumes that the slide
    container element is positioned within the
    navigator element.
  */
  Navigator.prototype.centerSlideContainerElement = function () {
    var margin = (this.element.width () - this.slideContainerElement.width ()) / 2;
    this.slideContainerElement.css ('left', margin);
  }

  /*
    Accepts no arguments, aligns the slide
    element with the left-hand side of this
    instance's element, and returns undefined.
  */
  Navigator.prototype.positionSlideElement = function () {
    var margin = Math.max (0, (this.slideContainerElement.width () - this.element.width ())/2);
    this.slideElement.css ('left', margin);
  }

  /*
    Accepts one argument: itemIndex, an integer
    that represents a valid item index; triggers
    this instance's flickity instance to select
    the item, and returns undefined.
  */
  Navigator.prototype.select = function (itemIndex) {
    this.flickity.select (itemIndex);
  }

  /*
    Accepts one argument: index, an integer
    that references a menu item element; slides
    the slide element so that the menu item
    referenced by index is positioned within
    the focus element; and returns undefined.
  */
  Navigator.prototype.slideTo = function (index) {
    var itemElement = this.getItemElement (index);
    var itemWidth = itemElement.width ();
    var itemLeft  = this.slideContainerElement.position ().left + this.slideElement.position ().left + itemElement.position ().left;
    var itemRight = itemLeft + itemElement.width ();
    var elementRight = this.element.width ();

    if (itemLeft < 0) {
      var delta = - itemLeft;
      return this.slide (delta);
    } else if (itemRight > elementRight) {
      var delta = Math.max (0, elementRight - itemWidth) - itemLeft;
      return this.slide (delta);
    }
  }

  /*
    Accepts no arguments, slides the slide
    element to the left, and returns undefined.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element.
  */
  Navigator.prototype.slideLeft = function () {
    this.slide (- this.element.outerWidth ());
  }

  /*
    Accepts no arguments, slides the slide
    element to the right, and returns undefined.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element.
  */
  Navigator.prototype.slideRight = function () {
    this.slide (this.element.outerWidth ());
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
    to the slide container element.
  */
  Navigator.prototype.slide = function (delta) {
    this.slideElement.animate ({left: this.slideElement.position ().left + this.constrainDelta (delta)});
  }

  /*
    Accepts one argument: delta, an integer
    that represents a pixel offset; and returns
    an integer, delta' that represents a valid
    pixel offset for the slide element.

    Note: this function assumes that the slide
    element is positioned absolutely relative
    to the slide container element.
  */
  Navigator.prototype.constrainDelta = function (delta) {
    var left       = this.slideElement.position ().left + this.slideContainerElement.position ().left;
    var margin     = this.slideElement.width () - this.element.width ();
    var leftMargin = margin + left;

    return delta < -leftMargin ? -leftMargin :
      (delta > -left ? -left : delta);
  } 

  /*
    Accepts one argument: index, a natural
    number that references an item element;
    and returns a jQuery HTML Element that
    represents the item element referenced
    by index.
  */
  Navigator.prototype.getItemElement = function (index) {
    return index < this.itemElements.length ? this.itemElements [index] : null;
  }

  /*
    Accepts no arguments, shows or hides the
    Slide Left and Slide Right buttons, and
    returns undefined.
  */
  Navigator.prototype.toggleButtons = function () {
    this.shouldShowButtons () ? this.showButtons () : this.hideButtons ();
  }

  /*
    Accepts no arguments, shows the Slide
    Left and Slide Right buttons, and returns
    undefined.
  */
  Navigator.prototype.showButtons = function () {
    this.slideLeftButtonElement.show ();
    this.slideRightButtonElement.show ();
  }

  /*
    Accepts no arguments, hides the Slide
    Left and Slide Right buttons, and returns
    undefined.
  */
  Navigator.prototype.hideButtons = function () {
    this.slideLeftButtonElement.hide ();
    this.slideRightButtonElement.hide ();
  }

  /*
    Accepts no arguments and returns true iff
    the Slide Left and Slide Right buttons should
    be displayed.
  */
  Navigator.prototype.shouldShowButtons = function () {
    return this.isSlideElementCropped ();
  }

  /*
    Accepts no arguments, updates the Slide
    Left and Slide Right buttons, and returns
    undefined.
  */
  Navigator.prototype.updateButtons = function () {
    this.shouldEnableSlideLeftButton ()?
      this.enableSlideLeftButton ():
      this.disableSlideLeftButton ();
    this.shouldEnableSlideRightButton ()?
      this.enableSlideRightButton ():
      this.disableSlideRightButton ();
  }

  /*
    Accepts no arguments, enables the slide left
    button, and returns undefined.
  */
  Navigator.prototype.enableSlideLeftButton = function () {
    this.slideLeftButtonElement.removeClass (getDisabledButtonClassName ());
  }

  /*
    Accepts no arguments, enables the slide right
    button, and returns undefined.
  */
  Navigator.prototype.enableSlideRightButton = function () {
    this.slideRightButtonElement.removeClass (getDisabledButtonClassName ());
  }

  /*
    Accepts no arguments, disables the slide left
    button, and returns undefined.
  */
  Navigator.prototype.disableSlideLeftButton = function () {
    this.slideLeftButtonElement.addClass (getDisabledButtonClassName ());
  }

  /*
    Accepts no arguments, disables the slide right
    button, and returns undefined.
  */
  Navigator.prototype.disableSlideRightButton = function () {
    this.slideRightButtonElement.addClass (getDisabledButtonClassName ());
  }


  /*
    Accepts no arguments and returns true iff
    the slide left button should be displayed.
  */
  Navigator.prototype.shouldEnableSlideLeftButton = function () {
    var left = this.slideContainerElement.position ().left + this.slideElement.position ().left;
    var right = left + this.slideElement.width ();
    return this.isSlideElementCropped () && right > this.element.width ();
  }

  /*
    Accepts no arguments and returns true iff
    the slide right button should be displayed.
  */
  Navigator.prototype.shouldEnableSlideRightButton = function () {
    return this.isSlideElementCropped () && (this.slideContainerElement.position ().left + this.slideElement.position ().left < 0);
  }

  /*
    Accepts no arguments and returns true iff the
    slide element has been cropped - I.E. the
    slide element is wider than the slide
    container element.
  */
  Navigator.prototype.isSlideElementCropped = function () {
    return this.element.width () < this.slideElement.width ();
  }

  /*
    Accepts no arguments, calls objectFitImages
    to scale images on IE, and returns undefined.

    Note: objectFitImages provides a Shim to
    simulate the object-fit CSS property. See:
    https://github.com/bfred-it/object-fit-images/
    for more information.
  */
  Navigator.prototype.scaleImages = function () {
    var imageElements = $('.' + getItemImageClassName ());
    objectFitImages (imageElements);
  }

  /*
    Accepts three arguments:

    * slideContainerElement, a jQuery HTML
      Element that represents a slide element
    * slideLeftButtonElement, a jQuery HTML
      Element that represents a slide left button
      element
    * and slideRightButtonElement, a jQuery
      HTML Element that represents a slide right
      button element

    and returns a jQuery HTML Element that
    represents a navigator containing the given
    component elements.
  */
  function createNavigatorElement (slideContainerElement, slideLeftButtonElement, slideRightButtonElement) {
    return $('<div></div>')
      .addClass (getNavigatorClassName ())
      .append (slideContainerElement)
      .append (slideLeftButtonElement)
      .append (slideRightButtonElement);
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a Slide Left
    button.
  */
  function createSlideLeftButtonElement (navigator) {
    return createButtonElement ()
      .addClass (getSlideLeftButtonClassName ())
      .click (function () {
        navigator.shouldEnableSlideLeftButton () && navigator.slideLeft ();
      });
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a Slide Right
    button.
  */
  function createSlideRightButtonElement (navigator) {
    return createButtonElement ()
      .addClass (getSlideRightButtonClassName ())
      .click (function () {
        navigator.shouldEnableSlideRightButton () && navigator.slideRight ();
      });
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents a generic
    button.

    Note: This function creates buttons that
    are disabled by default.
  */
  function createButtonElement () {
    return $('<div></div>').addClass (getButtonClassName ());
  }

  /*
    Accepts one argument: slideElement, a jQuery
    HTML Element that represents a slide element;
    and returns a jQuery HTML Element that
    represents a slide container element.
  */
  function createSlideContainerElement (slideElement) {
    return $('<div></div>')
      .addClass (getSlideContainerClassName ())
      .append (slideElement);
  }

  /*
    Accepts one argument: itemElements, a jQuery
    HTML Element set that represents a collection
    of item elements; and returns a jQuery HTML
    Element that represents a slide element
    containing itemElements.
  */
  function createSlideElement (itemElements) {
    return $('<div></div>')
      .addClass (getSlideClassName ())
      .append (itemElements)
      .draggable ({
        axis: 'x',
        containment: 'parent'
      });
  }

  /*
    Accepts one argument:

    * navigator, a Navigator instance

    and returns an array of jQuery HTML Elements
    that represents a collection of item elements
    where every cell image in flickity has an
    associated item.
  */
  function createItemElements (navigator) {
    return getFlickityCellElements (navigator.flickity).map (
      function (i, cellElement) {
        var imageElement = getImageElement ($(cellElement)).clone (true);
        return createItemElement (navigator, i, imageElement);
    }).toArray ();
  }

  /*
    Accepts three arguments:

    * navigator, a Navigator instance
    * itemIndex, an integer
    * and imageElement, a jQuery HTML Element
      that represents an IMG element

    and returns a jQuery HTML Element that
    represents an item element containing
    imageElement and linked to navigator.
  */
  function createItemElement (navigator, itemIndex, imageElement) {
    return $('<div></div>')
      .addClass (getItemClassName ())
      .attr (getItemIndexAttribute (), itemIndex)
      .append (imageElement
        .addClass (getItemImageClassName ()))
      .click (function () { navigator.select (itemIndex); });
  }

  // III. Auxiliary Functions

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and returns a jQuery HTML Element that
    represents cellElement's image element.
  */
  function getImageElement (cellElement) { return $('img', cellElement); }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns the cell elements
    associated with flickity as a jQuery
    HTML Set.
  */
  function getFlickityCellElements (flickity) {
    return $('.' + getCellClassName (), getFlickityElement (flickity));
  }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns the element associated
    with the instance as a jQuery HTML Element.
  */
  function getFlickityElement (flickity) { return $(flickity.element); }

  /*
    Accepts no arguments and returns all of the
    Flickity instances in an array of Flickity
    objects.
  */
  function getFlickityInstances () { return Drupal.flickity ? Drupal.flickity.instance : []; }

  /*
    Accepts no arguments and returns the name
    of the class used to label Flickity cell
    elements as a string.
  */
  function getCellClassName () { return 'gallery-cell'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label item images.
  */
  function getItemImageClassName () { return getItemClassName () + '-image'; }

  /*
    Accepts no arguments and returns the name
    of the item index attribute.
  */
  function getItemIndexAttribute () { return getItemAttributePrefix () + '-index'; } 

  /*
    Accepts no arguments and returns the prefix
    used by all item data attributes.
  */
  function getItemAttributePrefix () { return getAttributePrefix () + '-item'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label item elements.
  */
  function getItemClassName () { return getClassPrefix () + '-item'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label the slide element.
  */
  function getSlideClassName () { return getClassPrefix () + '-slide'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label the slide
    container element. 
  */
  function getSlideContainerClassName () { return getClassPrefix () + '-slide-container'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label the Slide Left
    button.

    Note: the button on the right slides the
    slide element to the left.
  */
  function getSlideLeftButtonClassName () { return getButtonClassName () + '-right'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label the Slide Right
    button.

    Note: the button on the left slides the
    slide element to the right.
  */
  function getSlideRightButtonClassName () { return getButtonClassName () + '-left'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label disabled button
    elements.
  */
  function getDisabledButtonClassName () { return getButtonClassName () + '-disabled'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label button elements.
  */
  function getButtonClassName () { return getClassPrefix () + '-button'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label navigator
    instances.
  */
  function getNavigatorClassName () { return getClassPrefix () + '-navigator'; }

  /*
    Accepts no arguments and returns the prefix
    used by data attributes defined by this
    module.
  */
  function getAttributePrefix () { return 'data-image-gallery'; }

  /*
    Accepts no arguments and returns the prefix
    used by classes defined by this module.
  */
  function getClassPrefix () { return 'image-gallery'; }
}) (jQuery);
