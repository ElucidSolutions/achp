/**
 * @file
 * This javascript uses the data supplied by the Block php code and 
 * generates all the elements that make up the section 106 flowchart 
 * and it controls the sliding behavior.
 */
(function ($) {

  /**
   * Global (sort of) constants used throughout the script
   */
  var BODY = '_body';
  var FEATURE = '_feature';
  var IMAGE = '_image';
  var LINK = '_link';
  var OVERLAY = '_overlay';
  var TITLE = '_title';
  var STEP = '_step'
  var WEIGHT = '_weight';
  var INNER_CONTAINER = '_inner_container';
  var READ_MORE = '_read_more';
  var HORIZONTAL_LINE = '_horizontal_line';
  var FLOWCHART = '_flowchart';
  var NAVIGATION = '_navigation';
  var CONTROLS = '_controls';
  var PREVIOUS = '_previous';
  var NEXT = '_next';
  var LEFT_ICON = '/modules/custom/section_106_process/images/left-arrow.svg';
  var RIGHT_ICON = '/modules/custom/section_106_process/images/right-arrow.svg';
  var RIGHT_ARROW_ICON = '/modules/custom/section_106_process/images/right-arrow-icon.svg';


  /**
   * Accepts no arguments and performs a number of tasks
   * which creates the DOM which represents the feature 
   * instance; attachs it to the section 106 process div;
   * and implements a number of behaviors such as nicescroll,
   * move the flowchart right or left by clicking on the
   * navigation control. Note: the feature instance renders
   * and behaves differently on the front pange and on the
   * individual content page. This functions returns undefined.
   */

  function FeatureInstance() {
    var instanceClassName = '.' + this.getModuleClassPrefix();
    var containerElement = $(instanceClassName);
    /**
     * First, add the flowchart navigation controls
     * i.e., next and previous buttons that control
     * the sliding of the flow chart.
     */
    var navigation = this.createNavigation();
    containerElement.append(navigation);
    /**
     * Create the feature instance element.
     */
    var bodyElement = this.createBodyElement();

    /**
     * The section 106 process steps is passed in from the 
     * Section106StepBlock PHP code. The drupalSettings
     * is a global verable.
     */
    var steps = drupalSettings.section_106_process.steps;

    /**
     * For each step in the in flowchart,
     * create a step element and insert it
     * as a child element in the body element.
     */
    var self = this;
    steps.forEach(function (step) {
      bodyElement.append(self.createStepElement(step));
    });
    /**
     * Once all step elements have been created
     * and attached to the body element, we will
     * then attached the body element to the outer
     * element. The container element will be a child
     * element of the outter most div with a class name
     * of section_106_process as define in the twig template.
     */
    containerElement.append(bodyElement);
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
    return 'section_106_process';
  }

  /**
   * Accepts no arguments; returns a JQuery 
   * HTML Element that represents a navigation element.
   */
  FeatureInstance.prototype.createNavigation = function () {
    var classPrefix = this.getFeatureClassName();
    var navigationElement = $('<div></div>').addClass(classPrefix + FLOWCHART + NAVIGATION);
    var previousElement = $('<div></div>').addClass(classPrefix + FLOWCHART + NAVIGATION + PREVIOUS);
    var nextElement = $('<div></div>').addClass(classPrefix + FLOWCHART + NAVIGATION + NEXT);
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
    var bodyElement = $('<div></div>').addClass(this.getFeatureClassName() + BODY);
    // there's an hr element beneath the title as designed
    var hrElement = $('<hr>').addClass(this.getFeatureClassName() + BODY + HORIZONTAL_LINE);
    // append the hr element to the body element
    bodyElement.append(hrElement);
    return bodyElement;
  }

  /**
   * Accepts no argument; adjust the width of the body element
   * based on the number of step elements; returns undefined.
   */
  FeatureInstance.prototype.adjustBodyElementWidth = function () {
    var classPrefix = this.getFeatureClassName();
    var numberOfStepElements = $('.' + classPrefix + STEP).length;
    var widthOfStepElement = $('.' + classPrefix + STEP).first().outerWidth();

    /**
     * The width of the body element is the sum of the width of each step element
     * plus the padding on the left side and the right side. The following also
     * takes into account various mobile sizes.
     */
    var windowSize = $(window).width();
    var bodyPadding;

    if (windowSize <= 320)
      bodyPadding = 20;
    else if (windowSize > 320 && windowSize <= 1024)
      bodyPadding = 70;
    else
      bodyPadding = 410;

    $('.' + classPrefix + BODY).css("padding-left", bodyPadding + "px");
    $('.' + classPrefix + BODY).css("padding-right", bodyPadding + "px");
    var widthOfBodyElement = (widthOfStepElement * numberOfStepElements) + (bodyPadding * 2);
    $('.' + classPrefix + BODY).css("width", widthOfBodyElement + "px");

  }

  /**
   * Accepts no argument; computes the length of the HR element
   * and establishes the starting left position of the element;
   * and returns undefined.
   */
  FeatureInstance.prototype.adjustHRElementWidthAndStaringPostion = function () {
    var classPrefix = this.getFeatureClassName();

    /**
     * Now establish the starting position of the HR line. First, get the 
     * div postion of the first step weight element
     */
    var firstStepElement = $('.' + classPrefix + STEP).first();
    var leftOfFirstStepElement = firstStepElement.position().left;
    $('.' + classPrefix + BODY + HORIZONTAL_LINE).css("left", leftOfFirstStepElement + "px");

    /**
     * Get the last image left offset position and add the with of the 
     * image to the the right offset position. The length of the HR 
     * element is just the right position minus the left position of
     * the step weight element.
     */
    var lastStepElement = $('.' + classPrefix + STEP).last();
    var lengthOfHRElement = (lastStepElement.position().left + (lastStepElement.outerWidth() / 2)) - leftOfFirstStepElement;
    $('.' + classPrefix + BODY + HORIZONTAL_LINE).css("width", lengthOfHRElement + "px");

  }

  /**
   * Accepts one argument: step, an object that contains
   * data for a flowchart step, render a JQuery
   * HTML Element that represents a feature
   * instance step element, and returns that object
   * to the caller.
   */
  FeatureInstance.prototype.createStepElement = function (step) {
    var classPrefix = this.getFeatureClassName();
    var stepElement = $('<div></div>').addClass(classPrefix + STEP);

    // create child element for step weight    
    var weightLinkElement = $('<a></a>').addClass(classPrefix + STEP + WEIGHT + LINK).attr('href', step.url).text(step.weight);
    stepElement.append(weightLinkElement);

    // Create an inner container
    var innerContainer = $('<div></div>').addClass(classPrefix + STEP + INNER_CONTAINER);

    // create child element for step image
    var imageContainerElement = $('<div></div>').addClass(classPrefix + STEP + IMAGE);
    var imageLinkElement = $('<a></a>').addClass(classPrefix + STEP + IMAGE + LINK).attr('href', step.url);
    var imageElement = $('<img>').attr('src', step.imageURL);
    imageLinkElement.append(imageElement);
    imageContainerElement.append(imageLinkElement);

    // if on content page, add an overlay element.
    if (this.isOnContentPage()) {
      var overlayElement = $('<div></div>').addClass(classPrefix + STEP + IMAGE + OVERLAY);
      imageContainerElement.append(overlayElement);
    }

    innerContainer.append(imageContainerElement);

    // create child element for step title
    var titlelinkElement = $('<a></a>').addClass(classPrefix + STEP + TITLE + LINK).attr('href', step.url).text(step.title);
    innerContainer.append(titlelinkElement);

    // create child element for step body link
    var bodyLinkElement = $('<a></a>').addClass(classPrefix + STEP + BODY + LINK).attr('href', step.url).html(step.body);
    innerContainer.append(bodyLinkElement);

    // create a read more link
    var readMorelinkElement = $('<a></a>').addClass(classPrefix + STEP + READ_MORE + LINK).attr('href', step.url).text("Read More");
    innerContainer.append(readMorelinkElement);
    stepElement.append(innerContainer);

    return stepElement;

  }

  /**
   * Accepts no arguments; instantiates nicescroll 
   * and enable dragging scroll mode, allowing users 
   * with touch devices to horizontally scroll the 
   * flowchart; and returns undefined.
   */
  FeatureInstance.prototype.installNiceScroll = function () {
    var moduleClassName = '.' + this.getModuleClassPrefix();
    var flowchart = $(moduleClassName);
    var niceScroll = flowchart.niceScroll({
      mousescrollstep: 0,
      cursorwidth: 0,
      scrollspeed: 100,
      zindex: 1001,
      enablemousewheel: false,
      cursoropacitymin: .2,
      cursoropacitymax: .7,
      cursorborder: 0,
      enablekeyboard: false,
      touchbehavior: true
    });

    flowchart.scrollLeft(0);
    return niceScroll;
  }

  /**
   * Accepts no arguments; selects the specified step; and
   * returns undefined.
   */
  FeatureInstance.prototype.selectStep = function (step) {

    // First, let's remove any selected step and dim down the step
    var stepClassName = this.getFeatureClassName() + STEP;

    // if it is already selected, then just return
    if (step.hasClass(stepClassName) && step.hasClass('current-step')) {
      return;
    }

    // Get the currently selected step
    var selected = $('.' + stepClassName + '.current-step');
    var overlayClassName = this.getFeatureClassName() + STEP + IMAGE + OVERLAY;

    // Remove selected step
    if (selected != null) {
      selected.removeClass('current-step');
      selected.find('.' + overlayClassName).css("opacity", "0.35");
    }

    // Now, select the specify step, and set the opacity back to 0
    step.addClass('current-step');
    step.find('.' + overlayClassName).css("opacity", "0");

    // Center the step element
    this.centerStepElement($(step));
  }

  /**
   * Accepts no arguments; centers content based 
   * when user click on a step; and returns
   * undefined.
   */
  FeatureInstance.prototype.centerStepElement = function (stepElement) {
    var moduleClassName = '.' + this.getModuleClassPrefix();
    flowchart = $(moduleClassName);

    //  get the current step element offset left
    var stepElementOffsetLeft = stepElement.offset().left;

    // Center point of the window is..        
    var centerOfWindow = $(window).width() / 2;

    // Slide left
    if (stepElementOffsetLeft > centerOfWindow) {
      var value = "+=" + (stepElementOffsetLeft - centerOfWindow);
      flowchart.animate({
        scrollLeft: value
      }, 500);
    }

    // Slide right
    else {
      var value = "-=" + (centerOfWindow - stepElementOffsetLeft);
      flowchart.animate({
        scrollLeft: value
      }, 500);
    }
  }

  /**
   * Accepts no arguments; registers a click handler 
   * for each step element; and returns undefined.
   */
  FeatureInstance.prototype.registerStepClickEventHandler = function () {
    var stepElements = $('.' + this.getFeatureClassName() + STEP);
    var featureInstance = this;
    stepElements.forEach(function (step) {
      step.click(function (event) {
        featureInstance.selectStep(step);
      });
    });
  }

  /**
   * Accepts no arguments; registers a mouse move 
   * handler to show and hide next and previous 
   * buttons; and returns undefined.
   */
  FeatureInstance.prototype.registerMouseMoveEventHandler = function () {
    var previousButton = $('.' + this.getFeatureClassName() + FLOWCHART + NAVIGATION + PREVIOUS);
    var nextButton = $('.' + this.getFeatureClassName() + FLOWCHART + NAVIGATION + NEXT);
    var moduleClassName = '.' + this.getModuleClassPrefix();
    $(moduleClassName).on('mousemove', function (event) {
      if ((event.pageX - this.offsetLeft) < $(this).width() / 2) {
        previousButton.css({
          'opacity': 1
        });
        nextButton.css({
          'opacity': 0
        });
      } else {
        nextButton.css({
          'opacity': 1
        });
        previousButton.css({
          'opacity': 0
        });
      }
    });

    // hide the buttons when mouse leaves the section 106 process section
    $('.section_106_process').on('mouseleave', function (e) {
      nextButton.stop().animate({
        'opacity': 0
      }, 300);
      previousButton.stop().animate({
        'opacity': 0
      }, 300);
    });
  }

  /**
   * Accepts no arguments; registers a mouse click handler 
   * to handle the sliding of the section 106 process 
   * flow chart; clicks previous will make the flowchart 
   * moved to the right by 1 step; clicks next will make 
   * the flowchart moved to the left by 1 step; and returns 
   * undefined.
   */
  FeatureInstance.prototype.registerNavigationClickEventHandler = function () {
    var previousButton = $("." + this.getFeatureClassName() + FLOWCHART + NAVIGATION + PREVIOUS);
    var nextButton = $("." + this.getFeatureClassName() + FLOWCHART + NAVIGATION + NEXT);
    var stepClassName = '.' + this.getFeatureClassName() + STEP;
    var stepElements = $(stepClassName);
    var currentElementIndex = 0;
    var self = this;
    // Start with the first element with index == 0
    previousButton.click(function (event) {
      if (currentElementIndex > 0) {
        currentElementIndex--;
        var step = $(stepElements[currentElementIndex]);
        // Center the step element
        self.centerStepElement(step);
      }
    });
    // Move to the right one step
    nextButton.click(function (event) {
      if (currentElementIndex < (stepElements.length - 1)) {
        currentElementIndex++;
        var step = $(stepElements[currentElementIndex]);
        self.centerStepElement(step);
      }
    });
  }

  /**
   * Accepts no arguments; checks if the the user
   * is viewing the achp site on a mobile-sized 
   * device, and hides the navigation control; 
   * and returns undefined.
   */
  FeatureInstance.prototype.registerWindowResizeEventHandler = function () {

    var navigationClassName = '.' + this.getFeatureClassName() + FLOWCHART + NAVIGATION

    // if on mobile, we hide the navigation controller            
    if ($(window).width() <= 580) {
      $(navigationClassName).css('display', 'none');
    }

    var moduleClassName = '.' + this.getModuleClassPrefix();
    flowchart = $(moduleClassName);
    var bodyElement = '.' + this.getFeatureClassName() + BODY;

    var self = this;
    $(window).bind('resize', function (event) {

      // if on mobile, we hide the navigation controller            
      if ($(window).width() <= 580) {
        $(navigationClassName).css('display', 'none');
      }
      // else, we display the navigation controller
      else {
        $(navigationClassName).css('display', 'block');
      }

      // Adjust the body width as the window resize.
      self.adjustBodyElementWidth();
      self.adjustHRElementWidthAndStaringPostion();

    });
  }

  /**
   * Accepts no arguments; returns true if the current 
   * path matches any of the individual step page URL. 
   * Otherwise, returns false.
   */
  FeatureInstance.prototype.isOnContentPage = function () {

    var url = window.location.href;
    var steps = drupalSettings.section_106_process.steps;

    for (var index = 0; index < steps.length; index++) {
      if ((steps[index]).url === url) {
        return true;
      }
    }
    return false;
  }

  /**
   * The following code is executed when the DOM is fully
   * loaded.
   */
  $(document).ready(function () {


    /**
     * Create a feature instance. The feature instance
     * in this module is the section 106 process block.
     */
    var featureInstance = new FeatureInstance();

    /**
     * Adjust the body width based on the number of steps.
     */
    featureInstance.adjustBodyElementWidth();

    /**
     * Adjust the HR width based on the number of steps, and also
     * establish the starting position of the horizontal line.
     */
    featureInstance.adjustHRElementWidthAndStaringPostion();

    /**
     * Code above here is for constructing the section 106 process
     * partial DOM based on data retrieved from the database. The data is
     * injected into the drupalSettings javascript object.
     ********************************************************************
     * Code below here is to construct the nicescroll behavior, and allow
     * the user to navigate previous or next by clicking on the arrow left 
     * or arrow right navigation control.
     */

    var niceScroll = featureInstance.installNiceScroll();

    /**
     * If the user selects a step, then load the step detailed page.
     */
    var stepClassName = '.' + featureInstance.getFeatureClassName() + STEP;
    if (featureInstance.isOnContentPage()) {
      var url = window.location.href;
      var steps = drupalSettings.section_106_process.steps;
      for (var index = 0; index < steps.length; index++) {
        if ((steps[index]).url === url) {
          var stepElements = $(stepClassName);
          featureInstance.selectStep($(stepElements[index]));
          break;
        }
      }
    }
    
    /**
     * Register mousemove handler to turnon and turnoff previous
     * and next buttons.
     */
    featureInstance.registerMouseMoveEventHandler();

    /**
     * Register navigation button click handler to
     * move the flowchart left or right
     */
    featureInstance.registerNavigationClickEventHandler();

    /**
     * Reposition the flowchart based on the window size.
     */
    featureInstance.registerWindowResizeEventHandler();

  });
})(jQuery);