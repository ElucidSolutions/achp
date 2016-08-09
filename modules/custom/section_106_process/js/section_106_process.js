/**
 * @file
 * This javascript uses the data supplied by the Block php code and 
 * generates all the elements that make up the section 106 flowchart 
 * and it controls the sliding behavior.
 */
(function ($) {

	/**
	 * Global constants used throughout the script
	 */
	var BODY = '_body';
	var FEATURE = '_feature';
	var IMAGE = '_image';
	var LINK = '_link';
	var OVERLAY = '_overlay';
	var TITLE = '_title';
	var STEP = '_step'
	var WEIGHT = '_weight';


	/**
	 * Accepts two arguments: a containerElement which is 
	 * a JQuery HTML Elementand a steps array
	 * which contains data pulled from the database; 
	 * creates a Section 106 Process Feature Instance; 
	 * creates an HTML element that represents the instance;
	 * attaches the element to containerElement;
	 * and returns the instance as a FeatureInstance
	 * object.
	 */

	function FeatureInstance(containerElement, steps) {
		/**
		 * Create the feature instance element.
		 */
		var bodyElement = this.createBodyElement();

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
	 * Accepts no arguments and returns a JQuery
	 * HTML Element that represents a feature
	 * instance body element.
	 */
	FeatureInstance.prototype.createBodyElement = function () {
		return $('<div></div>')
			.addClass(this.getFeatureClassName() + BODY);
	}

	/**
	 * Accepts no arguments and returns a JQuery
	 * HTML Element that represents a feature
	 * instance step element.
	 */
	FeatureInstance.prototype.createStepElement = function (step) {
		var classPrefix = this.getFeatureClassName();
		var stepElement = $('<div></div>')
			.addClass(classPrefix + STEP);

		// create child element for step weight
		var weightElement = $('<div></div>')
			.addClass(classPrefix + STEP + WEIGHT);
		var linkElement = $('<a></a>')
			.addClass(classPrefix + STEP + WEIGHT + LINK)
			.attr('href', step.url)
			.text(step.weight);
		weightElement.append(linkElement);
		stepElement.append(weightElement);

		// create child element for step image
		var imageContainerElement = $('<div></div>')
			.addClass(classPrefix + STEP + IMAGE);
		var imageElement = $('<img>')
			.attr('src', step.imageURI);
		var overlayElement = $('<div></div>')
			.addClass(classPrefix + STEP + IMAGE + OVERLAY);
		imageContainerElement.append(imageElement);
		imageContainerElement.append(overlayElement);
		stepElement.append(imageContainerElement);

		// create child element for step title
		var titleElement = $('<div></div>')
			.addClass(classPrefix + STEP + TITLE);
		linkElement = $('<a></a>')
			.addClass(classPrefix + STEP + TITLE + LINK)
			.attr('href', step.url)
			.text(step.title);
		titleElement.append(linkElement);
		stepElement.append(titleElement);

		// create child element for step body
		var bodyElement = $('<div></div>')
			.addClass(classPrefix + STEP + BODY);
		linkElement = $('<a></a>')
			.addClass(classPrefix + STEP + BODY + LINK)
			.attr('href', step.url)
			.html(step.body);
		bodyElement.append(linkElement);
		stepElement.append(bodyElement);

		return stepElement;
	}


	$(document).ready(function () {

		/**
		 * This array holds all the section 106 process steps.
		 */
		var steps = [];

		/**
		 * Retrieve the section 106 process steps passed from the 
		 * Section106StepBlock PHP code.
		 */
		steps = drupalSettings.section_106_process.steps;

		/**
		 * Create and attach the feature instance. The feature instance
		 * in this module is the section 106 process block which is
		 * embedded in the twig template.
		 */
		$('.section_106_process').each(function (i, containerElement) {
			var instance = new FeatureInstance($(containerElement), steps);
		});

	});

})(jQuery);