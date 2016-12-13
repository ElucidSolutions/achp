/*
  This module simply creates the icons
  displayed in site breadcrumbs.
*/
(function ($) {
  // SVG Icons
  var ICONS = {};

  /*
    Adds icons to the breadcrumb when the
    page loads.
  */
  $(document).ready (function () {
    addBreadcrumbIcons ();
  });

  /*
    Accepts no arguments and adds various icons
    to the breadcrumb.
  */
  function addBreadcrumbIcons () {
    addHomeIcon ();
    addArrowIcons ();
  }

  /*
    Accepts no arguments and adds the home icon
    to the breadcrumb's home link.
  */
  function addHomeIcon () {
    getBreadcrumbHomeItems ().map (
      function (i, itemElement) {
        getBreadcrumbItemLink ($(itemElement)).prepend (createHomeIconElement ());
    });
  }

  /*
    Accepts no arguments and adds the arrow
    icons between breadcrumb links.
  */
  function addArrowIcons () {
    getBreadcrumbItems ().slice (1).prepend (createArrowIconElement ());
  }

  /*
    Accepts no arguments and returns an HTML
    element that represents the home icon as a
    jQuery HTML Element.
  */
  function createHomeIconElement () {
    return createIconElement ('home', '/themes/achp/images/home-icon.svg');
  }

  /*
    Accepts no arguments and returns an HTML
    element that represents the right arrow icon
    as a jQuery HTML Element.
  */
  function createArrowIconElement () {
    return createIconElement ('arrow', '/themes/achp/images/right-arrow-icon-light.svg');
  }

  /*
    Accepts two arguments:

    * name, a string that represents a icon name
    * url, a URL that references an SVG icon

    loads the SVG icon referenced by url; resizes
    the icon iff height and width are given;
    and returns a element that represents the
    icon as a jQuery HTML Element.
  */
  function createIconElement (name, url) {
    return $('<div></div>')
      .addClass (getClassPrefix () + '-icon')
      .attr (getDataPrefix () + '-icon-name', name)
      .append (loadIcon (name, url));
  }

  /*
    Accepts two arguments: 

    * name, a string
    * and url, a URL string

    loads the SVG file referenced by url, caches
    the loaded icon, and returns the file as
    an SVGDocument.
  */
  function loadIcon (name, url) {
    if (!ICONS [name]) {
      $.ajax (url, {
        async: false,
        success: function (svgDocument) {
          ICONS [name] = svgDocument.documentElement;
        },
        error: function () {
          console.log ('[achp_theme] Error: an error occured while trying to load the "' + name + '" icon from "' + url + '".');
        }
      });
    }
    return ICONS [name] ? (ICONS [name]).cloneNode (true) : null;
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a breadcrumb
    item; and returns the item's link element
    as a jQuery HTML Set.
  */
  function getBreadcrumbItemLink (itemElement) { return $('> a', itemElement); }

  /*
    Accepts no arguments and returns the HTML
    element that represents the breadcrumb home
    item as a jQuery HTML Set.
  */
  function getBreadcrumbHomeItems () { return $('.' + getBreadcrumbHomeItemClassName ()); }

  /*
    Accepts no arguments and returns the HTML
    elements that represent the breadcrumb items
    as a jQuery HTML Set.
  */
  function getBreadcrumbItems () { return $('.' + getBreadcrumbItemClassName ()); }

  /*
    Accepts no arguments and returns the class
    used to label home items within breadcrumbs
    as a string.
  */
  function getBreadcrumbHomeItemClassName () { return 'breadcrumb_link_home'; }

  /*
    Accepts no arguments and returns the class
    used to label breadcrumb items as a string.
  */
  function getBreadcrumbItemClassName () { return 'breadcrumb_link'; }

  /*
    Accepts no arguments and returns the prefix
    used by all classes defined by this module.
  */
  function getClassPrefix () { return 'achp-breadcrumb'; }

  /*
    Accepts no arguments and returns the prefix
    used by all HTML data attributes defined by
    this module.
  */
  function getDataPrefix () { return 'data-achp-breadbrumb'; }
}) (jQuery);
