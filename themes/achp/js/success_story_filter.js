/* 
  Behavior for filter on success stories landing page
*/

(function ($) {

  Drupal.behaviors.success_story_filter = {
    attach: function (context, settings) {
      $(document).once ('success_story_filter').ajaxComplete (
        function (event, xhr, settings) {
         if (settings.url.indexOf ('/views/ajax') === 0) {
          setDropdownListener ();
        }
      });
    }
  }

  $(document).ready (function () {

    setDropdownListener ();

  })

  /*
    Accepts no arguments and sets a n on-change listener 
    on the dropdown filter.
  */
  function setDropdownListener () {
    // try {
    //   window.history.pushState("abc", "", "/?SomeParam");
    // }
    // catch (err) {
    //   console.log(err.message);
    // }

    getDropdownElement ().change (function () {
      submitFilterForm ();
    })


  }

  /*
    Accepts no arguments and submits this
    filter's view form by simulating a click on
    the form's submit button.
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
    HTML Element representing the dropdown element.
  */
  function getDropdownElement () {
    return getViewContainerElement ().find (getDropdownElementSelector ());
  }

  /*
    Accepts no arguments and returns a jQuery HTML Element
    that represents the submmit button for the news filter.
  */
  function getFilterSubmitButton () {
    return $('.' + getSubmitClassName ());
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