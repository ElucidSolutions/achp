<?php
/**
 * Defines the Issues In Preservation block.
 *
 * @Block(
 *   id = "issues_in_preservation_block",
 *   admin_label = @Translation("Issues In Preservation block")
 * )
 */
namespace Drupal\issues_in_preservation\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class IssuesInPreservationBlock extends BlockBase {
  /**
   * {@inheritdoc}
   * Builds and returns the renderable array for this block plugin.
   */ 
  public function build () {
    $issues  = $this->getIssuesInPreservation ();
    return array (
      '#attached' => array (
		'library' => array ('issues_in_preservation/issues_in_preservation_library'),
        'drupalSettings' => array (
          'issues_in_preservation' => array (
            'issues' => $issues
        ))
      ),
      '#theme' => 'issues_in_preservation'
    );
  }

  /**
   * Accepts no arguments and returns an array
   * of associative arrays that represent Issues In Preservation nodes (issues).
   *
   * This module does not allow any admin settings to 
   * be set.
   */    
  private function getIssuesInPreservation () {
    $issues  = array ();

    $query = \Drupal::entityQuery ('node')
      ->condition ('type', 'issue_in_preservation')      
      ->condition ('status', 1)
    
    $result = $query->execute ();
    foreach (array_keys ($result) as $nid) {
      $node = \Drupal\node\Entity\Node::load ($nid);
      $url  = \Drupal\Core\Url::fromRoute ('entity.node.canonical', ['node' => $nid], array ('absolute' => true));

      $steps [] = array (
        'id'     => $nid,
        'url'    => $url->toString (),        
        'imageURL'  => $node->get ('field_issue_image')->entity->url(),
        'title' => $node->get ('field_title')->value,
        'body' => $node->get ('body')->value
      );
    }

    \Drupal::logger ('issues_in_preservation')->notice ('[getIssuesInPreservation] steps: <pre>' . print_r ($issues, true) . '</pre>');
    return $issues;
  }
  
}