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
    Accepts no arguments, applies Chosen
    to replace select elements, and returns
    undefined.
  */
  function init () { $('.' + getClassName ()).chosen (); }

  /*
    Accepts no arguments and returns a string
    that represents the class used to label
    select elements.
  */
  function getClassName () { return 'achp-select'; }
})(jQuery);
