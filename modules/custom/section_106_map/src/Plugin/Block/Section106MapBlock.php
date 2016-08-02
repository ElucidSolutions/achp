<?php
/**
 * Defines the Section 106 Map block which uses
 * the Leaflet library to present a map of Section
 * 106 Cases.
 *
 * @Block(
 *   id = "section_106_map_block",
 *   admin_label = @Translation("Section 106 Map block")
 * )
 */
namespace Drupal\section_106_map\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class Section106MapBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build () {
    $config = \Drupal::config ('section_106_map.settings');
    $cases  = $this->getCases ();
    return array (
      '#attached' => array (
        'library' => array ('section_106_map/section_106_map_library'),
        'drupalSettings' => array (
          'section_106_map' => array (
            'mapbox_access_token'    => $config->get ('mapbox_access_token'),
            'filter_score_threshold' => $config->get ('filter_score_threshold'),
            'cases'                  => $cases
        ))
      ),
      // disable caching so that setting updates will take immediate effect. 
      '#cache' => array ('max-age' => 0),
      '#theme' => 'section_106_map'
    );
  }

  /*
    Accepts no arguments and returns an array
    of associative arrays that represent Section
    106 Case nodes.
  */
  private function getCases () {
    $cases  = array ();

    $query = \Drupal::entityQuery ('node')
      ->condition ('type', 'section_106_case_profile')
      ->condition ('status', 1);
    
    $result = $query->execute ();
    foreach (array_keys ($result) as $nid) {
      $node = \Drupal\node\Entity\Node::load ($nid);

      $cases [] = array (
        'id'     => $nid,
        'title'  => $node->getTitle (),
        'body'   => $node->get ('body')->value,
        'agency' => $this->getAgency   ($node->get ('field_case_federal_agency')->target_id),
        'state'  => $this->getTermName ($node->get ('field_case_location')->target_id),
        'status' => $this->getTermName ($node->get ('field_case_status')->target_id)
      );
    }

    \Drupal::logger ('section_106_map')->notice ('[getCases] cases: <pre>' . print_r ($cases, true) . '</pre>');
    return $cases;
  }

  /*
    Accepts one argument: $nid, a node ID that
    refers to a Federal Agency node; and returns
    the name of the referenced agency.
  */
  private function getAgency ($nid) {
    $node = \Drupal\node\Entity\Node::load ($nid);
    return is_null ($node) ? null :
      array (
        'title' => $node->getTitle ()
      );
  }

  /*
    Accepts one argument: $tid, a term ID;
    and returns the title of the referenced term.
  */
  private function getTermName ($tid) {
    $term = \Drupal::entityTypeManager () -> getStorage ('taxonomy_term')-> load ($tid);
    return is_null ($term) ? null : $term->getName ();
  }
}
