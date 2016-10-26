/**
 * @file
 * flickity.settings.js
 */

(function (Drupal) {

  Drupal.behaviors.flickity = {
    attach: function (context, settings) {
      for (var group in settings.flickity) {
        this.attachInit(group, settings.flickity[group]);
      }
    },

    /**
     * Find element to attach Flickity on.
     */
    attachInit: function(group, options) {
      var element = document.querySelector('.' + group + '.flickity');
      this.attachFlickity(element, options.settings);
    },

    /**
     * Attach & expose Flickity instance.
     */
    attachFlickity: function(element, settings) {
      var flickity = new Flickity(element, settings);
      Drupal.flickity.instance.push(flickity);
    }
  }

  /**
   * Flickity namespace exposure.
   *
   * @namespace
   */
  Drupal.flickity = {

    /**
     * Track Flickity instance.
     */
    instance: []
  }

})(Drupal);