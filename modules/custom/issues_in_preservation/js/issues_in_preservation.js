/**
 * @file
 * This javascript uses the data supplied by the Block php code and 
 * generates all the elements that make up the the Issues in
 * Preservation Module.
 */
(function ($) {

  /**
   * Global (sort of) constants used throughout the script
   */


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
    containerElement = $(instanceClassName);

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
    var bodyElement = $('<div></div>').addClass(this.getFeatureClassName() + BODY);
    return bodyElement;
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



  });
})(jQuery);