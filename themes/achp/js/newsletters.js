/* 
    Newsletters form behavior
*/

(function ($) { 

  $(document).ready (function () {

    /* For users of IE9, which does not accept the :valid
    pseudoselector, apply a blur event listener that will 
    apply and remove a has-input class */
    if (navigator.appVersion.indexOf("MSIE") != -1 &&
      parseFloat(navigator.appVersion.split("MSIE")[1]) <= 9) {
      listenForInput (getSusbcribeInputFieldElements ());
      listenForInput (getUnusbcribeInputFieldElements ());
    } 
  })

/*
  Accepts one argument, inputField, a jQuery Element representing
  an input field for a blur listener to be placed upon, and 
  returns undefined.
*/
  function listenForInput (inputField) {
    inputField.blur(function (e) {
      $(e.target).val() ? 
        $(e.target).siblings('label').addClass('has-input') :
        $(e.target).siblings('label').removeClass('has-input')
    })
  }

/*
  Accepts no arguments and returns a jQuery Element representing
  the subscribe input fields.
*/
  function getSusbcribeInputFieldElements () {
    return $('.' + getSusbcribeInputFieldClass ());
  }

/*
  Accepts no arguments and returns a jQuery Element representing
  the unsubscribe input fields.
*/
  function getUnusbcribeInputFieldElements () {
    return $('.' + getUnusbcribeInputFieldClass ());
  }

/*
  Accepts no arguments and returns a string representing
  the subscribe input fields.
*/
  function getSusbcribeInputFieldClass () {
    return 'subscribe-form-field-input';
  }

/*
  Accepts no arguments and returns a string representing
  the unsubscribe input fields.
*/
  function getUnusbcribeInputFieldClass () {
    return 'unsubscribe-form-field-input';
  }

})(jQuery);