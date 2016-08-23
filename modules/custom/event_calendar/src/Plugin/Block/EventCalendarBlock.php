<?php
/**
 * Defines the Event Calendar block.
 *
 * @Block(
 *   id = "event_calendar_block",
 *   admin_label = @Translation("Event Calendar block")
 * )
 */
namespace Drupal\event_calendar\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class EventCalendarBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build () {
    $config = \Drupal::config ('event_calendar.settings');
    $events  = $this->getEvents ();

    \Drupal::logger ('event_calendar')->notice ('[build]');

    return array (
      '#attached' => array (
        'library' => array ('event_calendar/event_calendar_library'),
        'drupalSettings' => array (
          'event_calendar' => array (
            'num_events'  => $config->get ('event_calendar_num_events'),
            'events'      => $events
        ))
      ),
      // disable caching so that setting updates will take immediate effect. 
      '#cache' => array ('max-age' => 0),
      '#theme' => 'event_calendar'
    );
  }

  /*
    Accepts no arguments and returns an array
    of associative arrays that represent Event nodes.
  */
  private function getEvents () {
    $events  = array ();

    $query = \Drupal::entityQuery ('node')
      ->condition ('type', 'event')
      ->condition ('status', 1);
    
    $result = $query->execute ();
    foreach (array_keys ($result) as $nid) {
      $node = \Drupal\node\Entity\Node::load ($nid);
      $url  = \Drupal\Core\Url::fromRoute ('entity.node.canonical', ['node' => $nid], array ('absolute' => true));

      $events [] = array (
        'id'          => $nid,
        'url'         => $url->toString (),
        'title'       => $node->getTitle (),
        'body'        => $node->get ('body')->value,
        'start_date'  => $node->get ('field_event_start_date')->value,
        'end_date'    => $node->get ('field_event_end_date')->value,
        'location'    => $node->get ('field_event_location')->value
      );
    }

    \Drupal::logger ('event_calendar')->notice ('[getEvents] events: <pre>' . print_r ($events, true) . '</pre>');
    return $events;
  }
}
