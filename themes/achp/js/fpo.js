/* 
  Behavior for staff directory filters
*/

(function ($) {

  Drupal.behaviors.fpo = {
    attach: function (context, settings) {
      $(document).once ('staff').ajaxComplete (
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
    getNotesWithText ();
    setTextInputPlaceholder ();
    removeSubmitButtonText ();
  }

  /*
    Accepts no arguments, sets placeholder text on the text input
    element, and returns undefined.
  */
  function setTextInputPlaceholder () {
    getTextInputElement ().attr('placeholder', 'Filter Preservation Officers');
  }

  /*
    Accepts no arguments, removes default text from the submit
    button, and returns undefined.
  */
  function removeSubmitButtonText () {
    getFilterSubmitButton ().attr('value', '');
  }

  /*
    Accepts no arguments, ends the parent h3 element of any notes
     that are not empty to addNotesPadding, and returns undefined.
  */
  function getNotesWithText () {
    $(getAgencyNotes ().each (function (i, note) {
      var note = $(note);
        if (note.text () != "") {
          addNotesPadding (note.parents('h3'));
        }
    }))
  }

  /*
    Accepts one argument, an HTML Element representing
    the h3 parent of an agency note element, finds the
    first title element of the following li's children,
    and adds top-padding.
  */
  function addNotesPadding (heading) {
    $(heading.next($('ul')).find('li:first .' + getFPONameClass ())).css('padding-top', '30px');
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
    that represents the container for the staff list.
  */
  function getViewContainerElement () {
    return $('#' + getViewContainerID ());
  }

  /*
    Accepts no arguments and returns all agency
    notes elements.
  */
  function getAgencyNotes () {
    return getViewContainerElement ().find('.' + getAgencyNotesClass ());
  }

  /*
    Accepts no arguments, and returns a string representing
    the class name of the FPO title (name) field.
  */
  function getFPONameClass () {
    return 'views-field-title';
  }

  /*
    Accepts no arguments and returns a string representing
    the agency notes class.
  */
  function getAgencyNotesClass () {
    return 'agency_notes';
  }  

  /*
    Accepts no arguments and returns a string representing
    the text input field selector.
  */
  function getTextInputSelector () {
    return 'input[type="text"]';
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
  function getViewContainerID () {
    return 'block-fpo-list';
  }   
 
}) (jQuery);