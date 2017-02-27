(function ($) {

  Drupal.behaviors.search = {
    attach: function (context, settings) {
      $(document).once ('search').ajaxComplete (
        function (event, xhr, settings) {
         if (settings.url.indexOf ('/views/ajax') === 0) {
          initFilterBehavior ();
          setPageCounter ();
        }
      });
    }
  }

  $(document).ready (function () {
    initFilterBehavior ();
    setPageCounter ();

  })

  function initFilterBehavior () {
    setSearchInputPlaceholder ();
    // setAdvancedSearchListener ();
  }

  function setAdvancedSearchListener () {
    getAdvancedSearchSubmitElement ().click (function (e) {
      // e.preventDefault ();
      submitFilterForm ();
      e.preventDefault ();
    })
  }

  /*
    Accepts no arguments,submits this filter's view form 
    by simulating a click on the form's submit button, 
    and returns undefined.
  */
  function submitFilterForm () {
    console.log('submit filter form called')
    getBasicSearchSubmitElement ().click ();
  }

  /*
    Accepts no arguments and returns a jQuery HTML element
    representing a submit button.
  */
  function getAdvancedSearchSubmitElement () {
    return $('#' + getAdvancedSearchContainerID () + ' .' + getSubmitClassName ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML element
    representing a submit button.
  */
  function getBasicSearchSubmitElement () {
    return $('#' + getBasicSearchContainerID () + ' .' + getSubmitClassName ());
  }

  function getBasicSearchContainerID () {
    return 'block-basic-search-form';
  }

  /*
    Accepts no arguments and returns a string
    that represents the view form button's
    class name.
  */
  function getAdvancedSearchContainerID () {
    return 'block-advanced-search-form';
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
    Accepts no arguments and sets the search results
    counter.
  */
  function setPageCounter () {
    getItemList ().css ('counter-reset', 'achp-theme-cases ' + getCounterStartIndex ());
  }

  /*
    Accepts no arguments and returns the list of 
    results.
  */
  function getItemList () {
    return $('.item-list-element', getItemListContainer ());
  }

  /* Accepts no arguments and returns the start index
  for the counter */
  function getCounterStartIndex () {
    return getItemListContainer ().attr ('data-achp-theme-view-start-index');
  }

  /* 
    Accepts no arguments and returns the item container
    list element
  */
  function getItemListContainer () {
    return $('.item-list', getViewContainerElement ());
  }

  /*
    Accepts no arguments, sets placeholder text on the text input
    element, and returns undefined.
  */
  function setSearchInputPlaceholder () {
    console.log('1')
    getSearchInputElement ().attr('placeholder', 'Search Keywords');
  }

  /*
    Accepts no arguments, sets placeholder text on the text input
    element, and returns undefined.
  */



  /*
    Accepts no arguments, removes default text from the submit
    button, and returns undefined.
  */
  // function removeSubmitButtonText () {
  //   getFilterSubmitButton ().attr('value', '');
  // }

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
    Accepts no arguments,s ubmits this filter's view form 
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
    HTML Element that represents the search
    input field.
  */
  function getSearchInputElement () {
    return getBasicSearchContainerID ().find (getSearchInputSelector ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the topic
    input field.
  */
  // function getTopicInputElement () {
  //   return getViewContainerElement ().find (getTopicInputSelector ());
  // }


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
    return $('#' + getViewContainerID ());
  }

  /*
    Accepts no arguments and returns a string representing
    the search input field selector.
  */
  function getSearchInputSelector () {
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
    return 'search-results-page';
  }   
}) (jQuery);