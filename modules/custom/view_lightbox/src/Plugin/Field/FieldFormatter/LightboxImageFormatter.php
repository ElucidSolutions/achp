<?php
/**
 * @file
 * This file defines the Lightbox Image
 * Field Formatter. This Field Formatter extends
 * the Image Field Formatter provided by the
 * Image module and extends the HTML output by
 * that formatter by adding the data attributes
 * and classes used by the Lightbox2 library.
 */

namespace Drupal\view_lightbox\Plugin\Field\FieldFormatter;

use Drupal\image\Plugin\Field\FieldFormatter\ImageFormatter;
use Drupal\image\Plugin\Field\FieldFormatter\ImageFormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Component\Utility\HTML;


/**
 * Plugin implementation of the 'lightbox_image' formatter.
 *
 * @FieldFormatter (
 *   id = "lightbox_image",
 *   label = @Translation("Lightbox Image"),
 *   field_types = {
 *     "image"
 *   }
 * )
 */
class LightboxImageFormatter extends ImageFormatter implements ContainerFactoryPluginInterface {
  /**
   * {@inheritdoc}
   *
   * Note: this function adds the data attributes
   * needed by the Lightbox2 library to the HTML
   * elements used to represent the given image
   * field items. It does this by setting the
   * Lightbox Image Formatter theme as the themer
   * for the image elements.
   */
  public function viewElements (FieldItemListInterface $items, $langcode) {
    $elements = parent::viewElements ($items, $langcode);

    // override the theme used to render the image elements.
    $field_name = $items->getName ();
    $files = $this->getEntitiesToView ($items, $langcode);
    foreach ($files as $delta => $file) {
      $elements [$delta]['#theme'] = 'lightbox_image_formatter';
      $elements [$delta]['#field_name'] = $field_name;
      $elements [$delta]['#attached'] = array (
        'library' => array ('view_lightbox/view_lightbox_library')
      );
    }
    return $elements;
  }
}
