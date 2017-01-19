/*
  This module overrides some of the default
  behavior of Flickity based slideshows, which
  are used by the ACHP Image Gallery feature.
*/
(function ($) {
  /*
    Initializes the Flickity instances once the
    page loads.
  */
  $(document).ready (function () {
    initializeFlickityInstances ();
  });

  /*
    Accepts no arguments, initializes all of the
    Flickity instances, and returns undefined.
  */
  function initializeFlickityInstances () {
    // I. initialize all flickity instances.
    getCarouselFlickity ().forEach (initCarouselFlickity);

    // II. Initialize Navigator instances.
    getNavigatorFlickity ().forEach (initNavigatorFlickity);
  }

  /*
    Accepts one argument: flickity, a Flickity
    object that represents a Flickity instance
    associated with a carousel; adjusts the
    padding of caption elements so that they
    align properly; and returns undefined.
  */
  function initCarouselFlickity (flickity) {
    imagesLoaded && imagesLoaded (flickity.slider,
      function () {
        initCarouselCells (flickity);

        // Invoke Fitie to shim the object-fit CSS property.
        flickity.cells.forEach (function (cell) {
          var imageElements = $('img', cell.element);
          imageElements.length > 0 && fitie (imageElements.get (0));
        });
    });
  }

  /*
    Accepts one argument: flickity, a Flickity
    object that represents the Flickity instance
    associated with the navigator scrollbar; sets
    the onSelect event handler for the instance
    so that it disables the previous and next
    buttons correctly; and returns undefined.
  */
  function initNavigatorFlickity (flickity) {
    // I. Align the caption element.
    setFlickityScrollHandler (flickity,
      function (progress, positionX) {
        progress < .01 ?
          disableFlickityPrevButton (flickity):
          enableFlickityPrevButton (flickity);

        progress > .99 ?
          disableFlickityNextButton (flickity):
          enableFlickityNextButton (flickity);
    });

    // II. Hide the navigator element if there is only one cell.
    flickity.cells.length <= 1 && $(flickity.element).hide ();
  }

  /*
    Accepts one argument: flickity, a Flickity
    object that represents a Flickity instance
    that is associated with a carousel; and
    aligns the captions within the instance's
    cells.
  */
  function initCarouselCells (flickity) {
    getFlickityCellElements (flickity).each (
      function (i, cellElement) {
        initCarouselCell ($(cellElement));
    });
  }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element
    in a carousel Flickity instance; and aligns
    cellElement's caption.
  */
  function initCarouselCell (cellElement) {
    setCellCaptionPadding (cellElement);
  }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and aligns cellElement's caption element
    as needed.

    Note: will snap align the caption to the
    image if the image is larger than the Image
    Width Threshold and smaller than the default
    caption padding.
  */
  function setCellCaptionPadding (cellElement) {
    if (getImage (cellElement).width () > getImageWidthThreshold ()) {
      var imageOffset = getImageOffset (cellElement);
      var captionOffset = getCaptionOffset (cellElement);

      if (imageOffset > captionOffset) {
        var padding = (imageOffset * 100) + '%';
        getCaption (cellElement)
          .css ('padding-left', padding)
          .css ('padding-right', padding);
      }
    }
  }

  /*
    Accepts two arguments:

    * flickity, a Flickity object
    * handler, a function that accepts two
      arguments: progress, an integer that
      represents the percent of the total width
      represented by the first slide offset;
      and positionX, the pixel offset of the
      first slide

    sets handler as the onScroll event handler
    for flickity and returns undefined.
  */
  function setFlickityScrollHandler (flickity, handler) {
    flickity.on ('scroll', handler);
  }

  /*
    Accepts no arguments and returns the Flickity
    instances associated with the carousels as
    a Flickity object array.
  */
  function getCarouselFlickity () {
    return getFlickityInstances ().filter (isCarouselFlickity);
  }

  /*
    Accepts no arguments and returns the Flickity
    instances associated with the navigator
    scrollbars as a Flickity object array.
  */
  function getNavigatorFlickity () {
    return getFlickityInstances ().filter (isNavigatorFlickity);
  }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns true iff the given
    instance is associated with a carousel.
  */
  function isCarouselFlickity (flickity) {
    return getFlickityElement (flickity).hasClass (getCarouselElementClassName ());
  }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns true iff the given
    Flickity instance is associated with the
    navigator scrollbar.
  */
  function isNavigatorFlickity (flickity) {
    return getFlickityElement (flickity).hasClass (getNavigatorElementClassName ());
  }

  /*
    Accepts one argument: flickity, a Flickity
    object; enables the instance's previous
    button; and returns undefined.
  */
  function enableFlickityPrevButton (flickity) { getFlickityPrevButton (flickity).enable (); }

  /*
    Accepts one argument: flickity, a Flickity
    object; enables the instance's next button;
    and returns undefined.
  */
  function enableFlickityNextButton (flickity) { getFlickityNextButton (flickity).enable (); }

  /*
    Accepts one argument: flickity, a Flickity
    object; disables the instance's previous
    button; and returns undefined.
  */
  function disableFlickityPrevButton (flickity) { getFlickityPrevButton (flickity).disable (); }

  /*
    Accepts one argument: flickity, a Flickity
    object; disables the instance's next button;
    and returns undefined.
  */
  function disableFlickityNextButton (flickity) { getFlickityNextButton (flickity).disable (); }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and returns a float that represents the ratio
    of cellElement's image's left offset to
    cellElement's width.
  */
  function getImageOffset (cellElement) {
    return getImage (cellElement).position ().left / cellElement.width ();
  }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and returns a float that represents the ratio
    of cellElement's caption's left offset to
    cellElement's width.
  */
  function getCaptionOffset (cellElement) {
    return getCaption (cellElement).position ().left / cellElement.width ();
  }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and returns cellElement's image element as
    a jQuery HTML Set.
  */
  function getImage (cellElement) {
    return $('.' + getImageClassName () + ' img', cellElement);
  }

  /*
    Accepts one argument: cellElement, a jQuery
    HTML Element that represents a cell element;
    and returns cellElement's caption element
    as a jQuery HTML Set.
  */
  function getCaption (cellElement) {
    return $('.' + getCaptionClassName (), cellElement);
  }

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
    object; and returns the instance's previous
    button as a PrevNextButton.
  */
  function getFlickityPrevButton (flickity) { return flickity.prevButton; }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns the instance's next
    button as a PrevNextButton.
  */
  function getFlickityNextButton (flickity) { return flickity.nextButton; }

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
    Accepts no arguments and returns the name of
    the class used to label the Flickity element
    associated with the carousel.
  */
  function getCarouselElementClassName () { return 'default_group'; }

  /*
    Accepts no arguments and returns the name of
    the class used to label the Flickity element
    associated with the navigator scrollbar.
  */
  function getNavigatorElementClassName () { return 'navigator'; }

  /*
    Accepts no arguments and returns the name of
    the class used to label cell image container
    elements.

    Note: this class was added to the field
    output using the "Rewrite Results" option
    in the Views UI.
  */
  function getImageClassName () { return 'carousel_image'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label caption elements.

    Note: this class was added to the field
    output using the "Rewrite Results" option
    in the Views UI.
  */
  function getCaptionClassName () { return 'carousel_caption'; }

  /*
    Accepts no arguments and returns the name
    of the class used to label Flickity cell
    elements as a string.
  */
  function getCellClassName () { return 'gallery-cell'; }

  /*
    Accepts no arguments and returns the minimum
    width (in pixels) that an image must be
    for this module to align its caption with
    its edges as an integer.
  */
  function getImageWidthThreshold () { return 300; }

}) (jQuery);
