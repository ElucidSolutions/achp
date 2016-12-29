/*
  This module is responsible for replacing
  select elements that have been tagged with the
  "achp-select" class.
*/
(function ($) {
  /*
    Applies Chosen to replace all select elements
    when the page loads.
  */
  $(document).ready (function () { init (); });

  /*
    Accepts no arguments, initializes the select
    elements, and returns undefined.
  */
  function init () { getSelectElements ().chosen ({width: '100%'}); }

  /*
    Accepts one argument: selectElement,
    a jQuery HTML Element that represents a
    select element; initializes selectElement;
    and returns undefined.
  */
  function initSelectElement (selectElement) { selectElement.chosen (); }

  /*
    Accepts no arguments and returns a jQuery
    HTML Set representing the select elements
    that should be rendered using Chosen.
  */
  function getSelectElements () { return $('.' + getSelectClassName ()); } 

  /*
    Accepts no arguments and returns a string
    that represents the class used to label
    select elements.
  */
  function getSelectClassName () { return getClassPrefix (); }

  /*
    Accepts no arguments and returns a string
    that represents the prefix used by all
    classes defined by this module.
  */
  function getClassPrefix () { return 'achp-select'; }
})(jQuery);
