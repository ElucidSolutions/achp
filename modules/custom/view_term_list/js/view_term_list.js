/*
  This module detects clicks on View term
  list filters and interfaces with the Drupal
  Select Term command to apply the selected
  filter terms.
*/
(function ($, Drupal, drupalSettings) {
  /*
    An integer that represents the maximum
    number of items to display in collapsed
    view mode.
 */
  var MAX_NUM_ITEMS = 10;

  /*
    An associative array of SVGDocuments keyed
    by name.
  */
  var ICONS = {};

  // Initializes the filter elements.
  $(document).ready (function () {
    // initializes all of the filters.
    initFilters ();
  });

  // Initialize all filters after each refresh.
  // See: https://www.drupal.org/docs/8/api/javascript-api
  Drupal.behaviors.view_term_list = {
    attach: function (context, settings) {
      $(document).once ('view_term_list').ajaxComplete (
        function (event, xhr, settings) {
          // initializes all of the filters on view updates.
          if (settings.url.indexOf ('/views/ajax') === 0) {
            initFilters ();
          }
      });
    }
  }

  /*
    Accepts no arguments and initializes all of
    the filter elements.
  */
  function initFilters () {
    _.invoke (getFilters (), 'initElement');
  }

  /*
    Accepts no arguments and returns the filters
    as an array of the Filters.
  */
  function getFilters () {
    return getListElements ().map (
      function (listElement) {
        return new Filter (getListFilterId ($(listElement)));
    });
  }

  /*
    Accepts one argument: filterId, a string;
    and returns a Filter object that
    represents a Term List filter.
  */
  function Filter (filterId) {
    this._id = filterId;
  }

  /*
    Accepts no arguments: adds deselect buttons
    and click event handlers to this filter's
    item elements; and returns undefined.
  */
  Filter.prototype.initElement = function () {
    var self = this;

    // add buttons and click event handlers.
    var selectedTermIds = this.getSelectedTermIds ();
    this.getItemElements ().forEach (
      function (_itemElement, i) {
        var itemElement = $(_itemElement);

        itemElement.attr (getItemIndexAttributeName (), i);
        i > MAX_NUM_ITEMS && itemElement.addClass (getOverflowItemClassName);


        var termId = getItemTermId (itemElement);
        if (_.contains (selectedTermIds, termId)) {
          itemElement
            .addClass (getSelectedItemClassName)
            .append (createItemDeselectButtonElement ())
            .click (function () {
              self.deselectTerm (termId);
              self.submitForm ();
            });
        } else {
          itemElement.click (function () {
            self.selectTerm (termId);
            self.submitForm ();
          });
        }
    });
  }

  /*
    Accepts no arguments and submits this
    filter's view form by simulating a click on
    the form's submit button.
  */
  Filter.prototype.submitForm = function () {
    this.getSubmitButtonElement ().click ();
  }

  /*
    Accepts one argument: termId, an integer
    that represents a taxonomy term ID; selects
    the HTML option element that is associated
    with the taxonomy term having termId; and
    returns undefined.
  */
  Filter.prototype.selectTerm = function (termId) {
    this.getOptionElement (termId).attr ('selected', 'selected');
  }

  /*
    Accepts one argument: termId, an integer that
    represents a taxonomy term ID; deselects
    the HTML option element that is associated
    with the taxonomy term that has termID;
    and returns undefined.
  */
  Filter.prototype.deselectTerm = function (termId) {
    this.getOptionElement (termId).removeAttr ('selected');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the view form
    submit button.
  */
  Filter.prototype.getSubmitButtonElement = function () {
    return $('.' + getSubmitClassName (), this.getViewElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the view element
    that contains this filter.
  */
  Filter.prototype.getViewElement = function () {
    return $('.js-view-dom-id-' + this.getViewId ());
  }

  /*
    Accepts no arguments and returns a string
    that represents the DOM ID of the view
    associated with this filter.
  */
  Filter.prototype.getViewId = function () {
    return getListViewId (this.getListElement ());
  }

  /*
    Accepts one argument: listElement, a jQuery
    HTML Element that represents a list element;
    and returns the DOM ID of the view associated
    with listElement.
  */
  function getListViewId (listElement) {
    return listElement.attr (getViewIdAttributeName ());
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a filter list
    item; and returns a jQuery HTML Element that
    represents the item's deselect button.

    Note: item deselect buttons are added by
    this module. See: Filter.init ().
  */
  function getItemDeselectButtonElement (itemElement) {
    return $('.' + getItemDeselectButtonClassName (), itemElement);
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a filter list
    item; and returns a jQuery HTML Element that
    represents the list item label.
  */
  function getItemLabelElement (itemElement) {
    return $('.' + getItemLabelClassName (), itemElement);
  }

  /*
    Accepts one argument: itemElement, a jQuery
    HTML Element that represents a filter list
    item; and returns a string that represents
    the id of the taxonomy term associated
    with itemElement.
  */
  function getItemTermId (itemElement) {
    return itemElement.attr (getItemTermAttributeName ());
  }

  /*
    Accepts one argument: termId, a string that
    represents a term ID; and returns the filter
    item element associated with termId as a
    jQuery HTML Element.
  */
  Filter.prototype.getItemElement = function (termId) {
    return $('.' + getItemClassName () + '[' + getItemTermAttributeName () + '="' + termId + '"]', this.getListElement ());
  }

  /*
    Accepts no arguments and returns this
    filter's list item elements as an array of
    DOM HTML Elements.
  */
  Filter.prototype.getItemElements = function () {
    return $('.' + getItemClassName (), this.getListElement ()).toArray ();
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the HTML list
    element associated with this filter.
  */
  Filter.prototype.getListElement = function () {
    return $('[' + getFilterAttributeName () + '="' + this.getId () + '"].' + getListClassName ());
  }

  /*
    Accepts no arguments and returns the set of
    terms currently selected in this filter as
    an array of strings.
  */
  Filter.prototype.getSelectedTermIds = function () {
    return this.getSelectedOptionElements ().map (function (optionElement) {
      return $(optionElement).val ();
    });
  }

  /*
    Accepts no arguments and returns this
    filter's selected option elements in a jQuery
    HTML Element array.
  */
  Filter.prototype.getSelectedOptionElements = function () {
    return $('option:selected', this.getSelectElement ()).toArray ();
  }

  /*
    Accepts one argument: termId, an integer that
    represents a taxonomy term ID; and returns a
    jQuery HTML element that represents the HTML
    option element associated with the taxonomy
    term that has termId.

    Note: we enable or disable term filters by
    selecting/deselecting these options.
  */
  Filter.prototype.getOptionElement = function (termId) {
    return $('option[value="' + termId + '"]', this.getSelectElement ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the HTML select
    element associated with this filter.
  */
  Filter.prototype.getSelectElement = function () {
    return $('[' + getFilterAttributeName () + '="' + this.getId () + '"].form-select');
  }

  /*
    Accepts one argument: listElement, a jQuery
    HTML Element that represents a filter list
    element; and returns a string that represents
    the ID of the filter that listElement is
    associated with.
  */
  function getListFilterId (listElement) {
    return listElement.attr (getFilterAttributeName ());
  }

  /*
    Accepts no arguments and returns the view
    term list elements in a DOM HTML Element
    array.
  */
  function getListElements () {
    return $('.' + getListClassName ()).toArray ();
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents an item deselect
    button.
  */
  function createItemDeselectButtonElement () {
    return $('<div></div>')
      .addClass (getItemDeselectButtonClassName ())
      .append ($(loadIcon ('deselect-button', '/modules/custom/view_term_list/images/close-icon.svg').documentElement));
  }

  /*
    Accepts no arguments and returns a string
    that represents this filter's id.
  */
  Filter.prototype.getId = function () {
    return this._id;
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
          ICONS [name] = svgDocument;
        },
        error: function () {
          console.log ('[view_term_list] Error: an error occured while trying to load the "' + name + '" icon from "' + url + '".');
        }
      });
    }
    return ICONS [name] ? (ICONS [name]).cloneNode (true) : null;
  }

  /*
    Accepts no arguments and returns a string
    that represents the item label class name.
  */
  function getItemLabelClassName () {
    return 'view_term_list_item_label';
  }

  /*
    Accepts no arguments and returns a string
    that represents the item deselect button
    element class name.
  */
  function getItemDeselectButtonClassName () {
    return 'view_term_list_item_deselect_button';
  }

  /*
    Accepts no arguments and returns a string
    that represents the class used to label
    overflow filter item elements.

    Overflow filter item elements are those items
    that should not be displayed when the filter
    is "collapsed".
  */
  function getOverflowItemClassName () {
    return getItemClassName () + '_overflow';
  }

  /*
    Accepts no arguments and returns a string
    that represents the class used to label
    selected item elements.
  */
  function getSelectedItemClassName () {
    return getItemClassName () + '_selected';
  }

  /*
    Accepts no arguments and returns a string
    that represents the item element class name.
  */
  function getItemClassName () {
    return 'view_term_list_item';
  }

  /*
    Accepts no arguments and returns a string
    that represents the list element class name.
  */
  function getListClassName () {
    return 'view_term_list_list';
  }

  /*
    Accepts no arguments and returns a string
    that represents the name of the data
    attribute used to specify filter item
    indicies.
  */
  function getItemIndexAttributeName () {
    return 'data-view-term-list-item-index';
  }

  /*
    Accepts no arguments and returns a string
    that represents the name of the data
    attribute used to specify the ID of the term
    associated with filter items.
  */
  function getItemTermAttributeName () {
    return 'data-term-id';
  }

  /*
    Accepts no arguments and return a string
    that represents the view DOM Id data
    attribute name.

    Note: this attribute is used to store the
    DOM ID of the view associated with a filter
    element.
  */
  function getViewIdAttributeName () {
    return 'data-view-term-list-view';
  }

  /*
    Accepts no arguments and returns a string
    that represents the filter data attribute
    name.
  */
  function getFilterAttributeName () {
    return 'data-view-term-list-filter';
  }

  /*
    Accepts no arguments and returns a string
    that represents the view form button's
    class name.
  */
  function getSubmitClassName () {
    return 'js-form-submit';
  }
}) (jQuery, Drupal, drupalSettings);
