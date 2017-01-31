/* 
  Behavior for success stories landing page
*/

(function ($) {

  Drupal.behaviors.success_stories_landing = {
    attach: function (context, settings) {
      $(document).once ('success_stories_landing').ajaxComplete (
        function (event, xhr, settings) {
         if (settings.url.indexOf ('/views/ajax') === 0) {
          initFilterBehavior ();
        }
      });
    }
  }


  $(document).ready (function () {
    
    initFilterBehavior ();

  })

  /*
    Accepts no arguments, returns undefined.
  */
  function initFilterBehavior () {
    checkForIE ();
    setTextInputPlaceholder ();
    removeSubmitButtonText ();
    setDropdownListener ();
  }

  /* 
    Accepts no arguments, checks to see if the browser is a version
    of IE above 9, and returns undefined.
   */
  function checkForIE () {
    if (window.navigator.userAgent.indexOf('Trident') > 0 && navigator.appVersion.indexOf("MSIE 9") === -1) {
      console.log('[success_stories_landing][checkforIE] IE10+ detected; removing incompatible styles');
      removeIEStyling ();
    }
  }
  
  /*
    Accepts no arguments, removes the dropdown element's 
    background image, and returns undefined.
  */
  function removeIEStyling () {
    console.log('removeIeStyling')
    getDropdownElement ().css('background-image', 'none');
  }

  /*
    Accepts no input, sets placeholder text on the text input
    element, and returns undefined.
  */
  function setTextInputPlaceholder () {
    getTextInputElement ().attr('placeholder', 'Filter Success Stories');
  }

  /*
    Accepts no input, removes default text from the submit
    button, and returns undefined.
  */
  function removeSubmitButtonText () {
    getFilterSubmitButton ().attr('value', '');
  }

  /*
    Accepts no arguments, sets an on-change listener 
    on the dropdown filter, and returns undefined.
  */
  function setDropdownListener () {
    getDropdownElement ().change (function () {
      submitFilterForm ();
    })
  }

  /*
    Accepts no arguments,submits this filter's view form 
    by simulating a click on the form's submit button, 
    and returns undefined.
  */
  function submitFilterForm () {
    getSubmitButtonElement ().click ();
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the view form
    submit button.
  */
  function getSubmitButtonElement () {
    return getViewContainerElement ().find (getFilterSubmitButton ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the text
    input field.
  */
  function getTextInputElement () {
    return getViewContainerElement ().find (getTextInputSelector ());
  }

  /* 
    Accepts no arguments and returns a jQuery
    HTML Element representing the dropdown element.
  */
  function getDropdownElement () {
    return getViewContainerElement ().find (getDropdownElementSelector ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the submit button for the news filter.
  */
  function getFilterSubmitButton () {
    return getViewContainerElement ().find (getFilterSubmitElement ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML element
    representing a submit button.
  */
  function getFilterSubmitElement () {
    return $(' .' + getSubmitClassName ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the container for the success story
    view that the filter applies to.
  */
  function getViewContainerElement () {
    return $('.' + getViewContainerClassName ());
  }

  /*
    Accepts no arguments and returns a string representing
    the text input field selector.
  */
  function getTextInputSelector () {
    return 'input[type="text"]';
  }

  /*
    Accepts no arguments and returns a string representing
    the dropdown element selector.
  */
  function getDropdownElementSelector () {
    return 'select';
  }

  /*
    Accepts no arguments and returns a string
    that represents the view form button's
    class name.
  */
  function getSubmitClassName () {
    return 'js-form-submit';
  }  

  /*
    Accepts no arguments and returns a string that
    represents the class name of the news landing
    page container.
  */
  function getViewContainerClassName () {
    return 'success_stories_list_container';
  }   
 
}) (jQuery);