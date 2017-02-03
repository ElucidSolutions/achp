/*
  This module creates and controls the Page Menu.

  When embedded within a page, the Page Menu
  lists the page headers. When a user clicks
  on a menu item, this module scrolls to the
  associated header. When the user scrolls down
  the page, the menu element will detatch and
  remain fixed to ensure that it is always visible
  on the page.
*/
(function ($) {
  /*
    A boolean flag that indicates whether or
    not the module is currently scrolling the
    page to a header menu.
  */
  SCROLLING = false;

  /*
    Scans the current page for page headers,
    creates page nav menus that lists the found
    headers, and appends the nav menus in the
    page menu instance containers found on the
    current page.
  */
  $(document).ready (function () {
    var contentRegionElement = $('#content_region');

    getInstanceContainerElements ().each (
      function (i, _instanceContainerElement) {
        var instanceContainerElement = $(_instanceContainerElement);
        var instance = new Instance (
          getInstanceContainerElementTitle (instanceContainerElement),
          getInstanceContainerElementMargin (instanceContainerElement),
          getInstanceContainerElementHeaderMargin (instanceContainerElement),
          getPageHeaderElements (getInstanceContainerElementTarget (instanceContainerElement)));

        if (instance.items.length >= getInstanceContainerElementMinNumItems (instanceContainerElement)) {
          instanceContainerElement.append (instance.element);
          instance.init ();

          contentRegionElement.css ('margin-left', instance.element.outerWidth (true));
          $(window).resize (function () {
            contentRegionElement.css ('margin-left', instance.element.outerWidth (true));
          });
        }
    });
  });

  /*
  */
  function Instance (title, margin, headerMargin, headerElements) {
    this.margin = margin;
    this.headerMargin = headerMargin;
    this.items = createMenuItems (this, headerElements);
    this.collapsibleElement = createCollapsibleElement (getMenuItemElements (this.items));
    this.menuElement = createMenuElement (this, title, this.collapsibleElement);
    this.element = createInstanceElement (this.menuElement);
  }

  /*
  */
  Instance.prototype.init = function () {
    var self = this;
    this.selectCurrentItem ();

    $(window).scroll (function () {
      self.positionMenuElement ();
      SCROLLING || self.selectCurrentItem ();
    });
  }

  /*
    Accepts no arguments, selects the menu item
    associated with the header that the menu
    element is currently vertically aligned with,
    and returns undefined.
  */
  Instance.prototype.selectCurrentItem = function () {
    var item = this.getCurrentItem ();
    item && this.select (item);
  }

  /*
  */
  Instance.prototype.select = function (item) {
    this.unhighlightItems ();
    item.highlight ();
  }

  /*
  */
  Instance.prototype.unhighlightItems = function () {
    this.items.forEach (function (item) {
      item.unhighlight ();
    });
  }

  /*
    Accepts no arguments and returns the menu
    item associated with the header that the menu
    element is currently vertically aligned with.

    Note: this function assumes that
    this.items is sorted in ascending order
    by item.getHeaderElementY.
  */
  Instance.prototype.getCurrentItem = function () {
    var item = null;
    var menuElementY = this.getMenuElementY ();
    for (var i = this.items.length - 1; i >= 0; i --) {
      item = this.items [i];
      if (menuElementY + item.element.position ().top >= item.getHeaderElementY ()) { break; }
    }
    return item;
  }

  /*
    Note: this function assumes that the menu
    element is absolutely positioned with respect
    to the instance element.
  */
  Instance.prototype.positionMenuElement = function () {
    this.menuElement.css ('top',
      Math.min (this.getMenuElementMaxY (),
        Math.max (this.getMenuElementMinY (),
                  getWindowY () + this.margin)) -
      this.getInstanceElementY ());
  }

  /*
  */
  Instance.prototype.getMenuElementMinY = function () {
    return this.getInstanceElementY ();
  }

  /*
  */
  Instance.prototype.getMenuElementMaxY = function () {
    return this.getInstanceElementY () + (this.element.height () - this.menuElement.height ());
  }

  /*
  */
  function getWindowY () {
    return $(window).scrollTop ();
  }

  /*
  */
  Instance.prototype.getInstanceElementY = function () {
    return this.element.offset ().top;
  }

  /*
  */
  Instance.prototype.getMenuElementY = function  () {
    return this.menuElement.offset ().top;
  }

  /*
  */
  Instance.prototype.toggle = function () {
    this.expanded ? this.collapse () : this.expand ();
  }

  /*
  */
  Instance.prototype.expand = function () {
    this.expanded = true;
    this.element.addClass (getMenuElementExpandedClassName ());
    this.collapsibleElement.slideDown ();
  }

  /*
  */
  Instance.prototype.collapse = function () {
    this.expanded = false;
    this.element.removeClass (getMenuElementExpandedClassName ());
    this.collapsibleElement.slideUp ();
  }

  /*
  */
  function getMenuItemElements (items) {
    return items.map (function (item) {
      return item.element;
    });
  }

  /*
  */
  function createMenuItems (menu, headerElements) {
    return headerElements.map (function (index, headerElement) {
      return new MenuItem (menu, index, $(headerElement));
    }).toArray ();
  }

  /*
  */
  function createCollapsibleElement (itemElements) {
    return $('<div></div>')
      .addClass (getMenuCollapsibleElementClassName ())
      .append ($('<ul></ul>')
        .addClass (getMenuListElementClassName ())
        .append (itemElements));
  }

  /*
  */
  function createMenuElement (menu, title, collapsibleElement) {
    return $('<div></div>')
      .addClass (getMenuElementClassName ())
      .append ($('<div></div>')
        .addClass (getMenuHeaderElementClassName ())
        .append ($('<div></div>')
          .addClass (getMenuHeaderElementClassName () + '-title')
          .text (title))
        .click (function () { menu.toggle (); }))
      .append (collapsibleElement);
  }

  /*
  */
  function createInstanceElement (menuElement) {
    return $('<div></div>')
      .addClass (getInstanceElementClassName ())
      .append (menuElement);
  }

  /*
  */
  function MenuItem (menu, index, headerElement) {
    this.menu  = menu;
    this.index = index;
    this.headerElement = headerElement;
    this.element = createMenuItemElement (this, headerElement);
  }

  /*
  */
  MenuItem.prototype.highlight = function () {
    this.element.addClass (getSelectedMenuItemElementClassName ());
  }

  /*
  */
  MenuItem.prototype.unhighlight = function () {
    this.element.removeClass (getSelectedMenuItemElementClassName ());
  }

  /*
  */
  MenuItem.prototype.scrollTo = function () {
    var self = this;

    if (SCROLLING) { return; }
    SCROLLING = true;

    var headerElementY = this.getHeaderElementY ();
    $.scrollTo (
      headerElementY < this.menu.getMenuElementMaxY () ?
        Math.max (0, Math.ceil (headerElementY - this.menu.margin - this.getElementY ())):
        Math.max (0, headerElementY - this.menu.headerMargin),
      {
        duration: 400,
        onAfter: function () {
          self.menu.positionMenuElement ();
          SCROLLING = false;
        }
      }
    );
  }

  /*
  */
  MenuItem.prototype.getHeaderElementY = function () {
    return this.headerElement.offset ().top;
  }

  /*
  */
  MenuItem.prototype.getElementY = function () {
    return this.element.position ().top;
  }


  /*
  */
  function createMenuItemElement (item, headerElement) {
    return $('<li></li>')
      .addClass (getMenuItemElementClassName ())
      .attr (getMenuItemElementIndexAttribute (), item.index)
      .text (headerElement.text ())
      .click (function () {
        item.menu.select (item);
        item.scrollTo ();
      });
  }

  /*
  */
  function getPageHeaderElements (target) {
    return $(target);
  } 

  /*
  */
  function getInstanceContainerElementTitle (instanceContainerElement) {
    return instanceContainerElement.attr (getInstanceContainerElementTitleAttribute ());
  }

  /*
  */
  function getInstanceContainerElementTarget (instanceContainerElement) {
    return instanceContainerElement.attr (getInstanceContainerElementTargetAttribute ());
  }

  /*
  */
  function getInstanceContainerElementMargin (instanceContainerElement) {
    return parseInt (instanceContainerElement.attr (getInstanceContainerElementMarginAttribute ()));
  }

  /*
  */
  function getInstanceContainerElementHeaderMargin (instanceContainerElement) {
    return parseInt (instanceContainerElement.attr (getInstanceContainerElementHeaderMarginAttribute ()));
  }

  /*
  */
  function getInstanceContainerElementMinNumItems (instanceContainerElement) {
    return parseInt (instanceContainerElement.attr (getInstanceContainerElementMinNumItemsAttribute ()));
  }

  /*
  */
  function getInstanceContainerElements () {
    return $('.' + getInstanceContainerElementClassName ());
  }

  /*
  */
  function getSelectedMenuItemElementClassName () {
    return getMenuItemElementClassName () + '-selected';
  }

  /*
  */
  function getMenuItemElementIndexAttribute () {
    return getMenuItemElementAttributePrefix () + '-index';
  }

  /*
  */
  function getMenuItemElementAttributePrefix () {
    return getMenuElementAttributePrefix () + '-item';
  }

  /*
  */
  function getMenuItemElementClassName () {
    return getMenuElementClassName () + '-item';
  }

  /*
  */
  function getMenuListElementClassName () {
    return getMenuElementClassName () + '-list';
  }

  /*
  */
  function getMenuHeaderElementClassName () {
    return getMenuElementClassName () + '-header';
  }

  /*
  */
  function getMenuCollapsibleElementClassName () {
    return getMenuElementClassName () + '-collapsible';
  }

  /*
  */
  function getMenuElementExpandedClassName () {
    return getMenuElementClassName () + '-expanded';
  }

  /*
  */
  function getMenuElementAttributePrefix () {
    return getInstanceElementAttributePrefix () + '-menu';
  }

  /*
  */
  function getMenuElementClassName () {
    return getInstanceElementClassName () + '-menu';
  }

  /*
  */
  function getInstanceElementAttributePrefix () {
    return getModuleAttributePrefix () + '-instance';
  }

  /*
  */
  function getInstanceElementClassName () {
    return getModuleClassPrefix () + '-instance';
  }

  /*
  */
  function getInstanceContainerElementTitleAttribute () {
    return getInstanceContainerElementAttributePrefix () + '-title';
  }

  /*
  */
  function getInstanceContainerElementTargetAttribute () {
    return getInstanceContainerElementAttributePrefix () + '-target';
  }

  /*
  */
  function getInstanceContainerElementMarginAttribute () {
    return getInstanceContainerElementAttributePrefix () + '-margin';
  }

  /*
  */
  function getInstanceContainerElementHeaderMarginAttribute () {
    return getInstanceContainerElementAttributePrefix () + '-header-margin';
  }

  /*
  */
  function getInstanceContainerElementMinNumItemsAttribute () {
    return getInstanceContainerElementAttributePrefix () + '-min-num-items';
  }

  /*
  */
  function getInstanceContainerElementAttributePrefix () {
    return getInstanceElementAttributePrefix () + '-container';
  }

  /*
  */
  function getInstanceContainerElementClassName () { 
    return getInstanceElementClassName () + '-container';
  }

  /*
  */
  function getPageHeaderElementClassName () {
    return getModuleClassPrefix () + '-header';
  }

  /*
  */
  function getModuleClassPrefix () { return 'page-menu'; }

  /*
  */
  function getModuleAttributePrefix () { return 'data-page-menu'; }
}) (jQuery)
