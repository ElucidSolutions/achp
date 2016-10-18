/*
  This module defines the dynamic behavior for
  the Image Gallery feature.
*/
(function ($) {
  $(document).ready (function () {
    // initializeFlickityElements ();
  });

  function initializeFlickityElements () {
    getFlickityElements ().forEach (initializeFlickityElement);
  }

  function initializeFlickityElement (flickityElement) {
    // I. create container element.
    var containerElement = createContainerElement ();
    flickityElement.prepend (containerElement);
    
    // II. move viewport and button elements into the container element.

    // move the previous button element.
    var prevButtonElement = getPrevButtonElement (flickityElement);
    prevButtonElement.length === 0 || containerElement.append (prevButtonElement);

    // move the viewport element.
    containerElement.append (getViewportElement (flickityElement));

    // move the next button element.
    var nextButtonElement = getNextButtonElement (flickityElement);
    nextButtonElement.length === 0 || containerElement.append (nextButtonElement);
  }

  function getPrevButtonElement (flickityElement) {
    return $('.' + getButtonClassName () + '.' + getPrevButtonClassName (), flickityElement);
  }

  function getNextButtonElement (flickityElement) {
    return $('.' + getButtonClassName () + '.' + getNextButtonClassName (), flickityElement);
  }

  function getViewportElement (flickityElement) {
    return $('.' + getViewportClassName (), flickityElement);
  }

  function getFlickityElements () {
    return $('.' + getFlickityClassName ()).toArray ().map ($);
  }

  function createContainerElement () {
    return $('<div></div>').addClass (getContainerClassName ());
  }

  function getPrevButtonClassName () { return 'previous'; }

  function getNextButtonClassName () { return 'next'; }

  function getButtonClassName () { return 'flickity-prev-next-button'; }

  function getViewportClassName () { return 'flickity-viewport'; }

  function getContainerClassName () { return 'image-gallery-container'; }

  function getFlickityClassName () { return 'flickity'; }
})(jQuery);
