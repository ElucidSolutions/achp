<?php
/**
 * Defines the Section 106 Process block.
 *
 * @Block(
 *   id = "section_106_process_block",
 *   admin_label = @Translation("Section 106 Process block")
 * )
 */
namespace Drupal\section_106_process\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class Section106ProcessBlock extends BlockBase {
  /**
   * {@inheritdoc}
   * Builds and returns the renderable array for this block plugin.
   */
  public function build () {
    $steps  = $this->getProcessSteps ();
    return array (
      '#attached' => array (
		'library' => array ('section_106_process/section_106_process_library'),
        'drupalSettings' => array (
          'section_106_process' => array (
            'steps' => $steps
        )) 
      ),
      '#theme' => 'section_106_process'
    );
  }

  /**
   * Accepts no arguments and returns an array
   * of associative arrays that represent Section
   * 106 Process nodes (steps).
   *
   * This module does not allow any admin settings to 
   * be set.
   */    
  private function getProcessSteps () {
    $steps  = array ();

    $query = \Drupal::entityQuery ('node')
      ->condition ('type', 'section_106_process_step')      
      ->condition ('status', 1)
      ->sort ('field_process_step_number', 'ASC');
    
    $result = $query->execute ();
    foreach (array_keys ($result) as $nid) {
      $node = \Drupal\node\Entity\Node::load ($nid);
      $url  = \Drupal\Core\Url::fromRoute ('entity.node.canonical', ['node' => $nid], array ('absolute' => true));

      $steps [] = array (
        'id'     => $nid,
        'url'    => $url->toString (),        
        'imageURL'  => $node->get ('field_process_step_image')->entity->url(),
        'title' => $node->get ('title')->value,
        'body' => $node->get ('field_process_step_summary')->value,
        'step_number' => $node->get ('field_process_step_number')->value
      );
    }

    \Drupal::logger ('section_106_process')->notice ('[getProcessSteps] steps: <pre>' . print_r ($steps, true) . '</pre>');
    return $steps;
  }
  
}
