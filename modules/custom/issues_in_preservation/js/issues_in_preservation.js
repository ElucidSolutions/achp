/*
 * @file
 * This javascript uses the data supplied by the Block php code and * generates all the elements that make up the section 106 flowchart * and it controls the sliding behavior.*/
(function ($) {

    /**
     * Constants used throughout the module script
     */
    var FEATURE = '_feature';
    var TABS = '_tabs';
    var TAB = '_tab';
    var CONTENT = '_content';
    var IMAGE = '_image';
    var LINK = '_link';
    var TITLE = '_title';
    var READ_MORE = '_read_more';

    /**
     * The following code is executed when the DOM is fully
     * loaded.
     */
    $(document).ready(function () {

      function FeatureInstance() {
        var instanceClassName = '.' + this.getModuleClassPrefix();
        var containerElement = $(instanceClassName);

        // Register tab event handler
        this.registerTabEventHandler();
      }

      /**
       * Accepts no arguments and returns a string
       * representing the name of the class used to
       * label feature instance elements.
       */
      FeatureInstance.prototype.getFeatureClassName = function () {
        return this.getModuleClassPrefix() + FEATURE;
      }

      /**
       * Accepts no arguments and returns a string
       * representing the name used to
       * label all class name in this module.
       */
      FeatureInstance.prototype.getModuleClassPrefix = function () {
        return 'issues_in_preservation';
      }

      /**
       * Accepts no arguments; returns a JQuery
       * HTML Element that represents a feature
       * instance body element.
       */
      FeatureInstance.prototype.createBodyElement = function () {

        var issues = drupalSettings.issues_in_preservation.issues;

        var bodyElement = $('<div></div>').addClass(this.getFeatureClassName() + BODY);
        bodyElement.append(this.createTabs());

        /**
         * Create tab content for each issue
         */
        var self = this;
        issues.forEach(function (issue) {
          bodyElement.append(self.createTabContent(issue));
        });

        return bodyElement;
      }

      /**
       * Accepts no arguments; and returns a tabs which is 
       * JQuery HTML element.
       */
      FeatureInstance.prototype.createTabs() = function () {
        var classPrefix = this.getFeatureClassName();
        var issues = drupalSettings.issues_in_preservation.issues;
        var tabs = $('<ul></ul').addClass(classPrefix + TABS);

        /**
         * Create a tab system using UL and LI tags.
         */
        var self = this;
        issues.forEach(function (issue) {
          tabs.append(self.createTabbedMenu(issue));
        });

        return return tabs;
      }

      /**
       * Accepts one argument; issue data object and 
       * returns a JQuery HTML tabbed menu element.
       */
      FeatureInstance.prototype.createTabbedMenu() = function (issue) {
        var classPrefix = this.getFeatureClassName();
        var tabMenuItem = $('<li></li');
        var tabLink = $('<a></a>').addClass(classPrefix + TAB + LINK).text(issue.title);
        tabMenuItem.append(tabLink);
      }

      /**
       * Accepts one argument; issue data object and 
       * returns a JQuery HTML tab content element.
       */
      FeatureInstance.prototype.createTabContent() = function (issue) {
        var classPrefix = this.getFeatureClassName();
        var tabContent = $('<div></div').attr("id", this.convertTitleToClassName(issue.title)).addClass(classPrefix + TAB + CONTENT);

        // create the image that represents the issue
        var imageLink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + IMAGE + LINK).attr('href', issue.url);
        var image = $('<img>').attr('src', issue.imageURL);
        imageLink.append(image);
        tabContent.append(imageLink);

        // create the issue title
        var titlelink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + TITLE + LINK).attr('href', issue.url).text(issue.title);
        tabContent.append(titlelink);

        // create the issue body text
        var bodyLinkElement = $('<a></a>').addClass(classPrefix + TAB + CONTENT + BODY + LINK).attr('href', issue.url).html(issue.body);
        tabContent.append(bodyLinkElement);

        // create a read more link
        var readMoreLink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + READ_MORE + LINK).attr('href', issue.url).text("Read More");
        tabContent.append(readMoreLink);

        return tabContent;
      }

      /**
       * Accepts no argument; register handlers; and return undefined.
       */
      FeatureInstance.prototype.registerTabEventHandler() = function () {
        var classPrefix = this.getFeatureClassName();
        $('ul.' + classPrefix + TABS + 'li').click(function (event) {
          var tabs = $('.' + classPrefix + TAB + CONTENT);
          tabs.each(function (tab) {});
        });
      }

      /**
       * Accepts one argument; a title which is a string, and
       * converts it to a class name; and returns it to the
       * caller.
       */
      FeatureInstance.prototype.convertTitleToClassName() = function (title) {
        return title.toLowerCase()..replace(/\_/g, ' ');
      }

      /**
       * Accepts one argument; a tab which the system should
       * programmatically select; and returns undefined.
       */
      FeatureInstance.prototype.selectTab() = function (tab) {

      }

    })(jQuery);