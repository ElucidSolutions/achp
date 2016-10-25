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
    getNavigatorFlickity ().forEach (initNavigatorFlickity);
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
    setFlickityScrollHandler (flickity,
      function (progress, positionX) {
        progress < .01 ?
          disableFlickityPrevButton (flickity):
          enableFlickityPrevButton (flickity);

        progress > .99 ?
          disableFlickityNextButton (flickity):
          enableFlickityNextButton (flickity);
    });
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
    Accepts no arguments and returns the flickity
    instances associated with the navigator
    scrollbars as a Flickity object array.
  */
  function getNavigatorFlickity () {
    return getFlickityInstances ().filter (isNavigatorFlickity);
  }

  /*
    Accepts one argument: flickity, a Flickity
    object; and returns true iff the given
    flickity instance is associated with the
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
    associated with the navigator scrollbar.
  */
  function getNavigatorElementClassName () { return 'navigator'; }
}) (jQuery);
