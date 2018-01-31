/*
  This module highlights the active step within
  Section 106 Process view block elements.

  Note: this script must be called before the
  Slide Format module's script has processed
  the current page.
*/
(function ($) {
  /*
    Finds every Section 106 Process view block
    and highlights the step within the block
    that represents the current page
  */
  $(document).ready (function () {
    highlightCurrentPageItems ();
  });

  /*
    Accepts no arguments; finds those Slide
    Format Target Item elements that represent
    Section 106 Process View Items that represent
    the current page; highlights those elements;
    and returns undefined.
  */
  function highlightCurrentPageItems () {
    getItemElements ().forEach (function (itemElement) {
      itemElement = $(itemElement);
      representsCurrentPage (itemElement) && itemElement.addClass ('slide-format-target-item-active');
    });
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a Slide Format
    Target Item element containing a Section
    106 Process View item; and returns true iff
    itemElement represents the current node.
  */
  function representsCurrentPage (itemElement) {
    return itemElementHasPath (drupalSettings.path.baseUrl + drupalSettings.path.currentPath, itemElement);
  }

  /*
    Accepts two arguments:

    * path, a string that represents a URL path
    * and itemElement, a jQuery HTML Element
      that represents a Slide Format Target Item
      element representing a Section 106 Process
      View Item

    and returns true iff the node represented
    by itemElement has a path equal to path.
  */
  function itemElementHasPath (path, itemElement) {
    return path === getItemElementPath (itemElement);
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a Slide Format
    Target Item element representing a Section
    106 Process View Item; and returns the path
    of the node represented by itemElement.
  */
  function getItemElementPath (itemElement) {
    return $('.views-field-path > .field-content', itemElement).text ().trim ();
  }

  /*
    Accepts no arguments, and returns a jQuery
    HTML Element Set that represents the set of
    Slide Format Target Item elements.
  */
  function getItemElements () { return $('.slide-format-target-item').toArray (); }

}) (jQuery);
