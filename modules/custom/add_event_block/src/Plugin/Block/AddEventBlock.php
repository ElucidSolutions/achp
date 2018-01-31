<?php
namespace Drupal\add_event\Plugin\Block;
use Drupal\Core\Block\BlockBase;

/**
 * The Add Event Block module defines a block that when
 * embedded in an Event node page displays an Add To 
 * Calendar link.
 *
 * @Block(
 *   id = "add_event",
 *   admin_label = @Translation("Add Event block")
 * )
 */
class AddEventBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build () {
    $node = \Drupal::service ('current_route_match')->getCurrentRouteMatch ()->getParameters ()->get ('node');
    if (is_null ($node)) {
      return null;
    }
    
    return [
      '#attached' => [
        'library' => ['add_event/add_event_library'],
        'drupalSettings' => [
          'add_event' => [ 
            'event'       => [
              'title'       => $node->getTitle (),
              'body'        => $node->get ('body')->value,
              'start_date'  => $node->get ('field_event_start_date')->value,
              'end_date'    => $node->get ('field_event_end_date')->value,
              'location'    => $node->get ('field_event_location')->value
            ],
            'system_timezone' => date_default_timezone_get ()
          ]
        ]
      ],
      '#cache' => array ('max-age' => 0),
      '#theme' => 'add_event'
    ];
  }
}
