/*
  This module is responsible for rewrite External
  Link entries that are displayed within the
  Related Resources block.
*/
(function ($) {
  /*
    Replaces the title link of every External
    Link entry displayed within a Related
    Resources block when the page loads.
  */
  $(document).ready (function () {
    getRelatedResourcesBlockElements ().forEach (
      function (blockElement) {
        getExternalLinkRowElements ($(blockElement)).forEach (
          function (rowElement) {
            rowElement = $(rowElement);
            setTitleLinkURL (getExternalLink (rowElement), rowElement);
        });
    });
  });

  /*
    Accepts two arguments:

    * url, an external URL string
    * rowElement, a jQuery HTML Element that
      represents a Related Resources View Row
      element

    sets the title link in rowElement to url
    and returns undefined.
  */
  function setTitleLinkURL (url, rowElement) {
    getTitleLinkElement (rowElement)
      .addClass (getExternalLinkClassName ())
      .attr ('href', url);
  }

  /*
    Accepts one argument: blockElement, a jQuery
    HTML Element that represents a Related
    Resources block element; and returns a
    jQuery HTML Result Set that lists the view
    row elements within blockElement that have
    an External Link Field element.
  */
  function getExternalLinkRowElements (blockElement) {
    return getRowElements (blockElement).filter (
      function (rowElement) {
        return hasExternalLinkFieldElement ($(rowElement));
    });
  }

  /*
    Accepts one argument: rowElement, a jQuery
    HTML Element that represents a Related
    Resources View Row element; and returns
    true iff rowElement contains an External
    Link element.
  */
  function hasExternalLinkElement (rowElement) {
    return getExternalLinkElement (rowElement).length > 0;
  }

  /*
    Accepts one argument: rowElement, a jQuery
    HTML Element that represents a Related
    Resources View Row; and returns a string
    that represents the external link URL.
  */
  function getExternalLink (rowElement) {
    return $('a', getExternalLinkFieldElement (rowElement)).attr ('href');
  }

  /*
    Accepts one argument: rowElement, a jQuery
    HTML Element that represents a Related
    Resources View Row; and returns a jQuery HTML
    Element that represents the row's External
    Link element.
  */
  function getExternalLinkElement (rowElement) {
    return $('.views-field-field-external-link > a', rowElement).first ();
  }

  /*
    Accepts one argument: rowElement, a jQuery
    HTML Element that represents a Related
    Resources View Row; and returns a jQuery HTML
    Element that represents the row's link
    element.
  */
  function getTitleLinkElement (rowElement) {
    return $('a', getTitleFieldElement (rowElement));
  }

  /*
    Accepts one argument: rowElement, a jQuery
    HTML Element that represents a Related
    Resources View Row; and returns a jQuery HTML
    Element that represents the row's title
    element.
  */
  function getTitleFieldElement (rowElement) {
    return $('.views-field-title', rowElement).first ();
  }

  /*
    Accepts one argument: blockElement, a jQuery
    HTML Element that represents a Related
    Resources Block element; and returns an
    array of jQuery HTML Elements that represent
    the row elements within blockElement.
  */
  function getRowElements (blockElement) {
    return $('.views-row', blockElement).toArray ();
  }

  /*
    Accepts no arguments and returns an array of
    jQuery HTML Elements that lists the Related
    Resource block elements on the current page.
  */
  function getRelatedResourcesBlockElements () {
    return $('[data-derivative-plugin-id^="related_resources-block_"]').toArray ();
  }

  /*
    Accepts no arguments and returns a string
    that represents the class used to label View
    Row Fields that link to external resources.
  */
  function getExternalLinkClassName () {
    return 'achp-external-link';
  }
}) (jQuery);
