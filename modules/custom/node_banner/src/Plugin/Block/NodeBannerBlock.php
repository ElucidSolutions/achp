<?php
namespace Drupal\node_banner\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * The Node Banner module defines a block that when
 * embedded in a node page displays a field from
 * the node as a banner image and overlays zero or
 * more additional fields from the enclosing node.
 *
 * @Block(
 *   id = "node_banner_block",
 *   admin_label = @Translation("Node Banner block")
 * )
 */
class NodeBannerBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration () {
    return [
      'node_banner_banner_field_name' => '',
      'node_banner_overlay_field_names' => ''
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm ($form, FormStateInterface $form_state) {
    $form ['node_banner_banner_field_name'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Banner Field'),
      '#default_value' => $this->configuration ['node_banner_banner_field_name'],
      '#required' => true,
      '#description' => $this->t ('The machine name of the field used for the background image.')
    );
    $form ['node_banner_overlay_field_names'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Overlay Fields'),
      '#default_value' => $this->configuration ['node_banner_overlay_field_names'],
      '#description' => $this->t ('A comma separated list of the machine names of the fields overlain over the background image.')
    );
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit ($form, FormStateInterface $form_state) {
    $this->configuration ['node_banner_banner_field_name'] = $form_state->getValue ('node_banner_banner_field_name');
    $this->configuration ['node_banner_overlay_field_names'] = $form_state->getValue ('node_banner_overlay_field_names');
  }

  /**
   * {@inheritdoc}
   */
  public function build () {
    $node = \Drupal::service ('current_route_match')->getCurrentRouteMatch ()->getParameters ()->get ('node');
    if (is_null ($node)) {
      return null;
    }
    $banner_field_name = $this->configuration ['node_banner_banner_field_name'];
    if (!$node->hasField ($banner_field_name)) {
      \Drupal::logger ('node_banner')->error ('[NodeBannerBlock::build] Error: "' . $banner_field_name . '" is an invalid field name.');
      return null;
    }
    $banner_field = $node->get ($banner_field_name);
    if (! $banner_field instanceof \Drupal\file\Plugin\Field\FieldType\FileFieldItemList) {
      \Drupal::logger ('node_banner')->error ('[NodeBannerBlock::build] Error: "' . $banner_field_name . '" is an invalid field. The Banner field must be an image field.');
      return null;
    }
    if ($banner_field->isEmpty ()) {
      \Drupal::logger ('node_banner')->error ('[NodeBannerBlock::build] Error: "' . $banner_field_name . '" is empty and could not be used to create a node banner.'); 
      return null;
    }
    $banner = $banner_field->first ();
    if (! $banner instanceof \Drupal\image\Plugin\Field\FieldType\ImageItem) {
      \Drupal::logger ('node_banner')->error ('[NodeBannerBlock::build] Error: "' . $banner_field_name . '" is an invalid field. The Banner field must be an image field.');
      return null;
    }
    $banner_image_fid = $banner->getValue ()['target_id'];
    $banner_image_file = \Drupal::entityTypeManager ()->getStorage ('file')->load ($banner_image_fid);
    if (!$banner_image_file) {
      \Drupal::logger ('node_banner')->error ('[NodeBannerBlock::build] Error: "' . $banner_field_name . '" is an invalid field. We could not load the image referenced by the field.');
      return null;
    }
    $banner_image_file_url = $banner_image_file->url ();

    $overlay_field_names = explode (',', $this->configuration ['node_banner_overlay_field_names']);
    $overlay_fields = [];
    foreach ($overlay_field_names as $overlay_field_name) {
      $overlay_field = $node->get ($overlay_field_name);
      $rendered_overlay_field = $overlay_field->view ('default');
      $overlay_fields [$overlay_field_name] = $rendered_overlay_field;
    }
    return [
      '#attached' => [
        'library' => ['node_banner/node_banner_library'],
        'drupalSettings' => []
      ],
      '#cache' => array ('max-age' => 0),
      '#theme' => 'node_banner',
      '#node_banner_banner_image_url' => $banner_image_file_url,
      '#node_banner_overlay_fields' => $overlay_fields
    ];
  }
}
