/*
  This module detects clicks on View term
  list filters and interfaces with the Drupal
  Select Term command to apply the selected
  filter terms.
*/
(function ($, Drupal, drupalSettings) {
  // Initializes the filter elements.
  $(document).ready (function () {
    // initializes all of filters.
    getFilters ().forEach (function (filter) {
      filter.initElement ();
    });
  });

  // Initialize all filters after each refresh.
  Drupal.behaviors.view_term_list = {
    attach: function (context, settings) {
      $(document).once ('view_term_list').ajaxComplete (
        function (event, xhr, settings) {
          // initializes all of filters.
          getFilters ().forEach (function (filter) {
            filter.initElement ();
          });
      });
    }
  }


  /*
    Accepts no arguments and returns the filters
    as an array of the Filters.
  */
  function getFilters () {
    return getListElements ().map (
      function (i, listElement) {
        return new Filter (getListFilterId ($(listElement)));
    }).toArray ();
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
    this.getItemElements ().each (
      function (i, _itemElement) {
        var itemElement = $(_itemElement);

        // create and append deselect button.
        itemElement.append (createItemDeselectButtonElement ());

        // add the label click event handler.
        var termId = getItemTermId (itemElement);
        getItemLabelElement (itemElement).click (function () {
          self.selectTerm (termId);
          self.refreshView ();
        });
        
        // add the deselect button click event handler.
        getItemDeselectButtonElement (itemElement).click (function () {
          self.deselectTerm (termId);
          self.refreshView ();
        });
    });
  }

  /*
    Accepts no arguments, refreshes the view that
    contains this filter, and returns undefined.

    See comments in the Views module
    (views/js/ajax_view.js) for details about
    the RefreshView event.
  */
  Filter.prototype.refreshView = function () {
    this.getViewElement ().trigger ('RefreshView');
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
    return itemElement.attr ('data-term-id');
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Set that represents this filters list
    item elements.
  */
  Filter.prototype.getItemElements = function () {
    return $('.' + getItemClassName (), this.getListElement ());
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
    Accepts no arguments and returns a jQuery
    HTML Element set that represents the view
    term list elements.
  */
  function getListElements () {
    return $('.' + getListClassName ());
  }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents an item deselect
    button.
  */
  function createItemDeselectButtonElement () {
    return $('<div></div>').addClass (getItemDeselectButtonClassName ());
  }

  /*
    Accepts no arguments and returns a string
    that represents this filter's id.
  */
  Filter.prototype.getId = function () {
    return this._id;
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
}) (jQuery, Drupal, drupalSettings);
