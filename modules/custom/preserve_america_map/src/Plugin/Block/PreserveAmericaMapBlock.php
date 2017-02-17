<?php
/**
 * Defines the Preserve America Map block which uses
 * the Leaflet library to map Preserve America
 * Communities.
 *
 * @Block(
 *   id = "preserve_america_map_block",
 *   admin_label = @Translation("Preserve America Map block")
 * )
 */
namespace Drupal\preserve_america_map\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class PreserveAmericaMapBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build () {
    $config = \Drupal::config ('preserve_america_map.settings');
    return array (
      '#attached' => array (
        'library' => array ('preserve_america_map/preserve_america_map_library'),
        'drupalSettings' => array (
          'module_path' => base_path () . drupal_get_path ('module', 'preserve_america_map'),
          'preserve_america_map' => array (
            'mapbox_access_token'    => $config->get ('mapbox_access_token'),
            'filter_score_threshold' => $config->get ('filter_score_threshold'),
            'profiles'               => $this->getProfiles ()
        ))
      ),
      // disable caching so that setting updates will take immediate effect. 
      '#cache' => array ('max-age' => 0),
      '#theme' => 'preserve_america_map'
    );
  }

  /*
    Accepts no arguments and returns an array
    of associative arrays that represent Preserve
    America Community nodes.
  */
  private function getProfiles () {
    $result = \Drupal::entityQuery ('node')
      ->condition ('type', 'preserve_america_community_profi')
      ->condition ('status', 1)
      ->execute ();

    $profiles  = [];
    foreach (array_keys ($result) as $nid) {
      $node = \Drupal\node\Entity\Node::load ($nid);
      $profiles [] = $this->createProfile ($node->toArray ());

      \Drupal::logger ('preserve_america_map')->notice ('[PreserveAmericaMapBlock::getProfiles] nid: ' . $nid);
    }
    return $profiles;
  }

  /*
    Accepts one argument: $node_array, an array
    that represents a Preserve America Community
    Profile node; and returns a profile record
    array that represents the profile.
  */
  private function createProfile ($node_array) {
    $nid = $this->getFieldValue ($node_array, 'nid');
    $url = \Drupal\Core\Url::fromRoute ('entity.node.canonical', ['node' => $nid], array ('absolute' => true));
    // \Drupal::logger ('preserve_america_map')->notice ('[PreserveAmericaMap::createProfile] node array: <pre>' . print_r ($node_array, true) . '</pre>');
    return [
      'id'        => $nid,
      'url'       => $url->toString (),
      'title'     => $this->getFieldValue ($node_array, 'title'),
      'body'      => $this->getSummaryBodyFieldValue ($node_array),
      'website'   => $this->getFieldValue ($node_array, 'field_community_website'),
      'location'  => $this->getFieldValue ($node_array, 'field_community_location'),
      'latitude'  => $this->getFieldValue ($node_array, 'field_community_coordinates', 'lat'),
      'longitude' => $this->getFieldValue ($node_array, 'field_community_coordinates', 'lng'),
      'states'    => $this->getReferencedTermsNames ($node_array, 'field_community_state')
    ];
  }

  /*
    Accepts two arguments:

    * $node_array, an array that represents
      a node
    * and $fieldName, a string that denotes
      a field name

    and returns the title of the node referenced
    by the given field.
  */
  private function getReferencedNodeTitle ($node_array, $fieldName) {
    $nid  = $this->getFieldValue ($node_array, $fieldName, 'target_id');
    $node = is_null ($nid) ? null : \Drupal\node\Entity\Node::load ($nid);
    return is_null ($node) ? null : $node->getTitle ();
  }

  /*
    Accepts two arguments:

    * $node_array, an array that represents
      a node
    * and $fieldName, a string that denotes
      a field name

    and returns the name of the term referenced
    by the given field as a string or null
    (if the field is empty).
  */
  private function getReferencedTermName ($node_array, $fieldName) {
    $tid = $this->getFieldValue ($node_array, $fieldName, 'target_id');
    return is_null ($tid) ? null : $this->getTermName ($tid);
  }

  /*
    Accepts two arguments:

    * $node_array, an array that represents
      a node
    * and $fieldName, a string that denotes
      a field name

    and returns a string array listing the names
    of the terms referenced by the given field.
  */
  private function getReferencedTermsNames ($node_array, $fieldName) {
    $names = [];
    $tids = $this->getFieldValues ($node_array, $fieldName, 'target_id');
    foreach ($tids as $tid) {
      $name = $this->getTermName ($tid);
      if ($name) {
        $names [] = $name;
      }
    }
    return $names;
  }

  /*
    Accepts one argument: $node_array, an array
    that represents a node; and returns the
    body summary or a trimmed version of the
    body field as a string.
  */
  private function getSummaryBodyFieldValue ($node_array) {
    $summary = $this->getFieldValue ($node_array, 'body', 'summary');
    return $summary ? $summary : (substr ($this->getFieldValue ($node_array, 'body'), 0, 600) . ' ...'); 
  }

  /*
    Accepts three arguments:

    * $node_array, an array that represents
      a node
    * $fieldName, a string that denotes a
      field name
    * and $fieldValueKey (default: "value")
      a string that specifies the key used to
      extract values from field arrays

    and returns either the field value as a
    string or null (if the field is empty).
  */
  private function getFieldValue ($node_array, $fieldName, $fieldValueKey = 'value') {
    return empty ($node_array [$fieldName]) ? null :
      $node_array [$fieldName][0][$fieldValueKey];
  }

  /*
    Accepts three arguments:

    * $node_array, an array that represents
      a node
    * $fieldName, a string that denotes a
      field name
    * and $fieldValueKey (default: "value")
      a string that specifies the key used to
      extract values from field arrays

    and returns an array listing the field's
    values.
  */
  private function getFieldValues ($node_array, $fieldName, $fieldValueKey = 'value') {
    $values = [];
    foreach ($node_array [$fieldName] as $field) {
      $values [] = $field [$fieldValueKey];
    }
    return $values;
  }

  /*
    Accepts one argument: $tid, a term ID;
    and returns the title of the referenced term.
  */
  private function getTermName ($tid) {
    $term = \Drupal::entityTypeManager ()->getStorage ('taxonomy_term')->load ($tid);
    return is_null ($term) ? null : $term->getName ();
  }
}
