/*
  This module is responsible for linking the
  Topic terms displayed on Digital Library
  document pages to the Digital Library Landing
  page.
*/
(function ($) {
  /*
    Replaces the Topic terms listed on Digital
    Library document pages with links to the
    Digital Library Landing page.
  */
  $(document).ready (function () {
    isDigitalLibraryDocumentPage () && setLinks ();
  });
  
  /*
    Accepts no arguments and returns true iff
    the current page represents a Digital Library
    Document page.
  */
  function isDigitalLibraryDocumentPage () {
    return _.contains (getDigitalLibraryDocumentNodeTypes (), getNodeType ());
  }

  /*
    Accepts no arguments and returns a string
    that represents the current page's node type.
  */
  function getNodeType () { return getPageElement ().attr ('data-page-node-type'); }

  /*
    Accepts no arguments, redirects the
    field_tags item links to reference the
    Digital Library Search Results page, and
    returns undefined.
  */
  function setLinks () {
    getTermElements ().each (function (i, termElement) {
      setLink ($(termElement));
    });
  }

  /*
    Accepts one argument: termElement, a jQuery
    HTML Element that represents a field_tags
    item element; redirects termElement's link
    to reference the Digital Library Search
    Results page; and returns undefined.
  */
  function setLink (termElement) {
    getTermLinkElement (termElement).attr ('href', getDigitalLibraryPath () + '&field_tags_target_id%5B%5D=' + getTermElementTargetID (termElement));
  }

  /*
    Accepts one argument: termElement, a jQuery
    HTML Element that represents a field_tags
    item element; and returns a jQuery HTML
    Element that represents its link.
  */
  function getTermLinkElement (termElement) { return $('a', termElement); }

  /*
    Accepts one argument: termElement, a jQuery
    HTML Element that represents a field_tags
    item element; and returns a string that
    represents the item's target ID.
  */
  function getTermElementTargetID (termElement) { return termElement.attr ('data-achp-field-item-target-id'); }

  /*
    Accepts no arguments and returns a jQuery
    Result Set that represents the field_tags
    item elements.
  */
  function getTermElements () { return $('.achp-field-item', getTagsFieldElement ()); }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the field_tags
    element.
  */
  function getTagsFieldElement () { return $('[data-achp-field-name="field_tags"]'); }

  /*
    Accepts no arguments and returns a jQuery
    HTML Element that represents the page
    element.
  */
  function getPageElement () { return $('#page'); }

  /*
    Accepts no arguments and returns a string
    that represents the path to the Digital
    Library results page.
  */
  function getDigitalLibraryPath () {
    return '/digital-library-landing/digital-library?keys=&field_tags_target_id_2=All';
  }

  /*
    Accepts no arguments and returns a string
    array listing the node types presented in
    the Digital Library.
  */
  function getDigitalLibraryDocumentNodeTypes () {
    return [
      'alternative_procedure',
      'exemption',
      'guidance_document',
      'legislation',
      'memorandum_of_agreement',
      'opinion_statement',
      'policy_document',
      'program_comments',
      'programmatic_agreement',
      'prototype_programmatic_agreement',
      'publication',
      'regulation',
      'report',
      'whitepapers'
    ];
  }
}) (jQuery);
