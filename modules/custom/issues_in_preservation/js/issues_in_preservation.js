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
   var WRAPPER = '_wrapper';
   var CONTENT = '_content';
   var CONTAINER = '_container';
   var RIGHT = '_right';
   var BODY = '_body';
   var IMAGE = '_image';
   var LINK = '_link';
   var TITLE = '_title';
   var TEXT = '_text';
   var READ_MORE = '_read_more';
   var NAVIGATION = '_navigation';
   var CONTROLS = '_controls';
   var PREVIOUS = '_previous';
   var NEXT = '_next';
   var LEFT_ICON = '/modules/custom/issues_in_preservation/images/left-arrow.svg';
   var RIGHT_ICON = '/modules/custom/issues_in_preservation/images/right-arrow.svg';
   var RIGHT_ARROW_ICON = '/modules/custom/issues_in_preservation/images/right-arrow-icon.svg';

   function FeatureInstance() {

    var instanceClassName = '.' + this.getModuleClassPrefix();
    var containerElement = $(instanceClassName);

    /**
     * First, add the navigation controls
     * i.e., next and previous buttons that control
     * the sliding of the tabbed menu.
     */
     var navigation = this.createNavigation();
     containerElement.append(navigation);

     var bodyElement = this.createBodyElement();
     containerElement.append(bodyElement);

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
   * HTML Element that represents a navigation element.
   */
   FeatureInstance.prototype.createNavigation = function () {
    var classPrefix = this.getFeatureClassName();
    var navigationElement = $('<div></div>').addClass(classPrefix + TABS + NAVIGATION);
    var previousElement = $('<div></div>').addClass(classPrefix + TABS + NAVIGATION + PREVIOUS);
    var nextElement = $('<div></div>').addClass(classPrefix + TABS + NAVIGATION + NEXT);
    navigationElement.append(previousElement);
    navigationElement.append(nextElement);
    return navigationElement;
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
     var contentContainer = $('<div></div>').addClass(this.getFeatureClassName() + CONTENT + CONTAINER);
     var self = this;
     issues.forEach(function (issue) {
      contentContainer.append(self.createTabContent(issue));
    });

     bodyElement.append(contentContainer);

     return bodyElement;
   }

  /**
   * Accepts no arguments; and returns a tabs which is 
   * JQuery HTML element.
   */
   FeatureInstance.prototype.createTabs = function () {
    var classPrefix = this.getFeatureClassName();
    var issues = drupalSettings.issues_in_preservation.issues;

    var tabsWrapper = $('<div></div>').addClass(classPrefix + TABS + WRAPPER);
    var tabs = $('<ul></ul').addClass(classPrefix + TABS);
    tabsWrapper.append(tabs);

    /**
     * Create a tab system using UL and LI tags.
     */
     var self = this;
     issues.forEach(function (issue) {
      tabs.append(self.createTab(issue));
    });

     return tabsWrapper;
   }

  /**
   * Accepts one argument; issue data object and 
   * returns a JQuery HTML tabbed menu element.
   */
   FeatureInstance.prototype.createTab = function (issue) {
    var classPrefix = this.getFeatureClassName();
    var tabMenuItem = $('<li></li').addClass(classPrefix + TAB);
    var tabLink = $('<a></a>').addClass(classPrefix + TAB + LINK).text(issue.title);
    tabMenuItem.append(tabLink);
    return tabMenuItem;
  }

  /**
   * Accepts one argument; issue data object and 
   * returns a JQuery HTML tab content element.
   */
   FeatureInstance.prototype.createTabContent = function (issue) {
    var classPrefix = this.getFeatureClassName();
    var tabContent = $('<div></div').attr("id", this.convertTitleToClassName(issue.title)).addClass(classPrefix + TAB + CONTENT);

    // create the image that represents the issue
    var image = $('<div></div').addClass(classPrefix + TAB + CONTENT + IMAGE);
    image.css("background-image", "url(" + issue.imageURL + ")");
    var imageLink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + IMAGE + LINK).attr('href', issue.url);    
    image.append(imageLink);
    tabContent.append(image);

    var leftContentContainer = $('<div></div').addClass(classPrefix + TAB + CONTENT + CONTAINER + RIGHT);
    // create the issue title
    var titlelink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + TITLE + LINK).attr('href', issue.url).text(issue.title);
    leftContentContainer.append(titlelink);

    // create the issue body text
    var bodyLinkElement = $('<a></a>').addClass(classPrefix + TAB + CONTENT + BODY + LINK).attr('href', issue.url).html(issue.summary);
    leftContentContainer.append(bodyLinkElement);

    // create a read more link
    
    var readMoreText = $('<div></div>').addClass(classPrefix + TAB + CONTENT + READ_MORE + TEXT);
    var readMoreLink = $('<a></a>').addClass(classPrefix + TAB + CONTENT + READ_MORE + LINK).attr('href', issue.url).text("Read More About" + " " + issue.title);
    readMoreLink.append(readMoreText);
    leftContentContainer.append(readMoreLink);

    tabContent.append(leftContentContainer);
    return tabContent;
  }

  /**
   * Accepts no argument; adjust the width of each tab (li) 
   * element based on the size of each word; returns undefined.
   */
   FeatureInstance.prototype.adjustTabWidth = function () {
    var classPrefix = this.getFeatureClassName();

    // Get all the tabs
    var tabs = $('.' + classPrefix + TAB + LINK);

    // Get the font size and font name
    var fontSize = tabs.first().css("font-size");
    var fontName = tabs.first().css("font-family");
    var fontWeight = tabs.first().css("font-weight");

    /**
     * Create a dummy span element, add the similar 
     * properties, and use JQuery to obtain the size. 
     * This is how we obtain the width of the widest word.
     */
     var dummyElement = $('<div></div>').css({'display': 'none', 'font-size': fontSize, 'font-family': fontName, 'font-weight': fontWeight, 'text-transform': 'uppercase'});

     // append it to the first tab and then after 
     // all is done, remove it from the first tab.
     tabs.first().append(dummyElement);

    // Get the text of each tab
    tabs.each(function(tabIndex) {
      var stringTokens = $(this).text().split(" ");
      var tabWidth = 0;
      var width = 0;

      /**
       * Append the token to the dummy element
       * and use JQuery width() to calculate
       * width. Iterate through the tokens array
       * and track the token that gives
       * widest width.
       */
       $.each(stringTokens, function(index) {
        dummyElement.text(stringTokens[index]);
        width = dummyElement.outerWidth();
        if (width > tabWidth) {
          tabWidth = width;
        }
      });

      $(this).css("width", tabWidth);
    });    

    // Done so let's remove the dummy element.
    dummyElement.remove();
  }

  /**
   * Accepts no arguments; instantiates nicescroll 
   * and enable dragging scroll mode, allowing users 
   * with touch devices to horizontally scroll the 
   * tabbed menu; and returns undefined.
   */
   FeatureInstance.prototype.installNiceScroll = function () {
    var classPrefix = this.getFeatureClassName();
    var className = '.' + classPrefix + TABS + WRAPPER;
    var tabsWrapper = $(className);
    var niceScroll = tabsWrapper.niceScroll({
      mousescrollstep: 0,
      cursorwidth: 0,
      scrollspeed: 100,
      zindex: 1001,
      enablemousewheel: false,
      cursoropacitymin: .2,
      cursoropacitymax: .7,
      cursorborder: 0,
      enablekeyboard: false,
      cursordragontouch: true,
      touchbehavior: true
    });

    /**
     * Get the previous and next elements;
     * pass to niceScroll; disable next button
     * at scrollend, and disable previous button
     * at scrollstart.
     */
    var previousElement = $('.' + classPrefix + TABS + NAVIGATION + PREVIOUS);
    var nextElement = $('.' + classPrefix + TABS + NAVIGATION + NEXT);
    var self = this;
    niceScroll.onscrollend = function (data) {
      self.enableDisableNavigation(niceScroll, previousElement, nextElement);
    }
    
    // Calculate the width of the tabbed menu
    var tabbedMenuWidth = this.calculateTabbedMenuWidth();
    var tabs = $('.' + classPrefix + TABS);
    // if on mobile, we hide the navigation controller   
    var windowWidth =  $(window).width();        
    if (windowWidth <= tabbedMenuWidth) {
      if (windowWidth <= 414) {
        tabs.css("width", "1200px");
      }
      else {
        tabs.css("width", "1500px");       
      }
      tabsWrapper.scrollLeft(0);
    }
    return niceScroll;
  }

  /**
   * Accepts no argument; register event handler which 
   * show selected tab content when click; and return 
   * undefined.
   */
   FeatureInstance.prototype.registerTabEventHandler = function () {
    var classPrefix = this.getFeatureClassName();

    this.hideAllIssues();

    // Show only content of tab that was clicked.    
    var self = this;
    $('ul.' + classPrefix + TABS + ' li').click(function () {
      $(this).siblings('li').removeClass('active');
      $(this).addClass('active')
      var id = self.convertTitleToClassName($(this).text());
      self.showIssue(id);
    });
  }

  /**
   * Accepts one argument; id which is the id of the tab
   * content to be display; and return undefined.
   */
   FeatureInstance.prototype.showIssue = function (id) {
    var classPrefix = this.getFeatureClassName();
    $('.' + classPrefix + TAB + CONTENT).not('#' + id).hide();
    $('#' + id).show();
  }

  /**
   * Accepts no arguments; hides all tab content; 
   * and return undefined.
   */
   FeatureInstance.prototype.hideAllIssues = function () {
    var classPrefix = this.getFeatureClassName();
    $('.' + classPrefix + TAB + CONTENT).hide();
  }

  /**
   * Accepts one argument; a title which is a string, and
   * converts it to a class name by replacing spaces with
   * underscore characters; and returns the new string to the
   * caller.
   */
   FeatureInstance.prototype.convertTitleToClassName = function (title) {
    return title.toLowerCase().replace(/\ /g, '_');
  }

  /**
   * Accepts one argument; a tab which the system should
   * programmatically select; and returns undefined.
   */
   FeatureInstance.prototype.selectTab = function (tabIndex) {

    var className = '.' + this.getFeatureClassName() + TAB;
    var tabs = $(className);
    if (tabIndex >= tabs.length) {
      return;
    } else {
      $(className)[tabIndex].click();
    }
  }

  /**
   * Accepts no arguments; registers a mouse click handler 
   * to handle the sliding of the section 106 process 
   * flow chart; clicks previous will make the flowchart 
   * moved to the right by 1 step; clicks next will make 
   * the flowchart moved to the left by 1 step; and returns 
   * undefined.
   */
   FeatureInstance.prototype.registerNavigationClickEventHandler = function (niceScroll) {
    var classPrefix = this.getFeatureClassName();
    var previousButton = $("." + classPrefix + TABS + NAVIGATION + PREVIOUS);
    var nextButton = $("." + classPrefix + TABS + NAVIGATION + NEXT);
    var tabs = $("." + classPrefix + TAB);

    /**
     * The distance of the slide is calculated by taking the
     * distance between left position of the current tab and 
     * the left position of the next tab.
     */
    var currentTab = 0;    
    var numberOfTabs = tabs.length;
    var self = this;
    // Move to the left one tab
    previousButton.click(function (event) {
      if (currentTab > 0) {
        var distance = Math.abs(tabs.get(currentTab).offsetLeft - tabs.get(--currentTab).offsetLeft);
        self.slideTab("left", distance);  
        self.enableDisableNavigation(niceScroll, previousButton, nextButton);
      }
    });
    // Move to the right one tab
    nextButton.click(function (event) {
      if ((currentTab + 1) < numberOfTabs) {
        var distance = Math.abs(tabs.get(currentTab).offsetLeft - tabs.get(++currentTab).offsetLeft);
        self.slideTab("right", distance);  
        self.enableDisableNavigation(niceScroll, previousButton, nextButton);            
      }
    });    
  }

  /**
   * Accepts three arguments; niceScroll object which
   * controls the scrolling of the tabs, the previous
   * element which scrolls the tabs to the right;
   * the next element which scrolls the tabs to
   * the left. The next element is disabled at scroll end
   * state. The previous element is disabled at scroll
   * start state. Both next and previous elements are
   * enabled otherwise. This function returns
   * an undefined object.
   */
   FeatureInstance.prototype.enableDisableNavigation = function (niceScroll, previousElement, nextElement) {
    // If at scroll start (start of the tab list)
    if (niceScroll.scrollvaluemaxw == niceScroll.scroll.x) {
      previousElement.removeClass('disabled');
      nextElement.addClass('disabled');      
    } 

    // Else if at scroll end (end of the tab list)
    else if (niceScroll.scroll.x == 0) {
      previousElement.addClass('disabled');
      nextElement.removeClass('disabled');        
    }
    // Else, enable both buttons because there is room to move in both directions.
    else {
      previousElement.removeClass('disabled');
      nextElement.removeClass('disabled');      
    }    
  }
  /**
   * Accepts one argument; a boolean flag which indicates
   * whether to hide or show the navigation; and returns 
   * undefined.
   */
   FeatureInstance.prototype.showNavigation = function (flag) {
    var navigationClassName = $("." + this.getFeatureClassName() + TABS + NAVIGATION);
    if (flag) {
      $(navigationClassName).css('display', 'block');
    }
    else {
      $(navigationClassName).css('display', 'none');
    }
  }

  /**
   * Accepts no arguments; calculates the total
   * width of the tabbed menu and return it to the caller.
   */
   FeatureInstance.prototype.calculateTabbedMenuWidth = function () {
    
    var tabs = $('.' + this.getFeatureClassName() + TAB);
    var numberOfTabs = tabs.length;
    var width = Math.abs(tabs.get(0).offsetLeft - tabs.get(numberOfTabs - 1).offsetLeft) + 200;
    
    return width;      
  }


  /**
   * Accepts no arguments; checks if the the user
   * is viewing the achp site on a mobile-sized 
   * device, and hides the navigation control; 
   * and returns undefined.
   */
   FeatureInstance.prototype.registerWindowResizeEventHandler = function () {

    // Calculate the width of the tabbed menu
    var tabbedMenuWidth = this.calculateTabbedMenuWidth();

    var tabs = $('.' + this.getFeatureClassName() + TABS);

    // if on mobile, we hide the navigation controller 
    var windowWidth = $(window).width();
    if (windowWidth <= tabbedMenuWidth) {
      this.showNavigation(true);
      if (windowWidth <= 414) {
        tabs.css("width", "1200px");
      }
      else {
        tabs.css("width", "1500px");       
      }
      tabs.scrollLeft(0);
    }
    else {
      this.showNavigation(false);
    }
    
    var self = this;
    $(window).bind('resize', function (event) {
      var windowWidth = $(window).width() ;
      /**
       * If the window width is less than the width of the 
       * tabbed menu, go ahead and show the navigation
       * so that users can click on next or previous.
       */
       if (windowWidth <= tabbedMenuWidth) {
        self.showNavigation(true);
      }
      else {
        self.showNavigation(false);
      }
    });
  }

  /**
   * Accepts no arguments; moves the tabs in the direction specified
   * by the distance specified; and returns undefined.
   * 
   * Alternatively, instead of setting the scrollLeft property, we
   * could call niceScroll.doScrollBy(200) to move to the right by 200
   * pixels or niceScroll.doScrollBy(-200) to move to the left 200 pixels.
   */
   FeatureInstance.prototype.slideTab = function (direction, distance) {
    var className = '.' + this.getFeatureClassName() + TABS + WRAPPER;
    tabsWrapper = $(className);

    // Slide left
    if (direction === "right") {
      var value = "+=" + distance;
      tabsWrapper.animate({
        scrollLeft: value
      }, 500);
    }

    // Slide right
    else if (direction === "left") {
      var value = "-=" + distance;
      tabsWrapper.animate({
        scrollLeft: value
      }, 500);
    }
    else {
      // invalid option
      return;
    }
  }


  /**
   * The following code is executed when the DOM is fully
   * loaded.
   */
   $(document).ready(function () {

     /**
     * Create a feature instance. The feature instance
     * in this module is the issue in preservation block.
     */
     var featureInstance = new FeatureInstance();

    /**
     * Adjust the width of each tab based the text size.
     */
     featureInstance.adjustTabWidth();

    /** 
     * Install nice scroll to allow user to swipe the
     * tabbed menu.
     */
    var niceScroll = featureInstance.installNiceScroll();
    

    /**
     * Register tab click event handler.
     */
     featureInstance.registerTabEventHandler();

    /**
     * Click on the first tab to initialize
     */
     featureInstance.selectTab(0);

    /**
     * Register navigation button click handler to
     * move the tabbed menu left or right
     */
     featureInstance.registerNavigationClickEventHandler(niceScroll);

    /**
     * Reposition the tabbed menu based on the window size.
     */
     featureInstance.registerWindowResizeEventHandler();


   });

 })(jQuery);
