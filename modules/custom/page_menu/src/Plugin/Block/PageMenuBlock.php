<?php
namespace Drupal\page_menu\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Defines the Page Menu block which, when
 * embedded within a page, creates a nav menu
 * listing the page headers. When a user clicks
 * on a menu item, this module scrolls to the
 * associated header. When the user scrolls down
 * the page, the menu element will detatch and
 * remain fixed to ensure that it is always visible
 * on the page.
 *
 * @Block(
 *   id = "page_menu_block",
 *   admin_label = @Translation("Page Menu block")
 * )
 */
class PageMenuBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration () {
    return array (
      'page_menu_target' => 'h2',
      'page_menu_margin' => 0,
      'page_menu_header_margin' => 0,
      'page_menu_min_num_items' => 0
    );
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm ($form, FormStateInterface $form_state) {
    $form ['page_menu_target'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Target'),
      '#default_value' => $this->configuration ['page_menu_target'],
      '#required' => true,
      '#description' => $this->t ('The jQuery selector that will be used to select target headers for this nav menu.')
    );
    $form ['page_menu_margin'] = array (
      '#type' => 'number',
      '#title' => $this->t ('Margin'),
      '#default_value' => $this->configuration ['page_menu_margin'],
      '#required' => true,
      '#description' => $this->t ('The minimum margin that the page menu will try to maintain from the top of the page as the user scrolls down the page.')
    );
    $form ['page_menu_header_margin'] = array (
      '#type' => 'number',
      '#title' => $this->t ('Header Margin'),
      '#default_value' => $this->configuration ['page_menu_header_margin'],
      '#required' => true,
      '#description' => $this->t ('When the user selects a menu item whose header is below the menu scroll area, this module directs them directly to the item. This field specifies the margin that separating the top of the page from the header.') 
    );
    $form ['page_menu_min_num_items'] = array (
      '#type' => 'number',
      '#title' => $this->t ('Minimum Number of Items'),
      '#default_value' => $this->configuration ['page_menu_min_num_items'],
      '#required' => true,
      '#description' => $this->t ('The minimum number of headers that must be present on a page before this module inserts a nav menu.')
    );
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit ($form, FormStateInterface $form_state) {
    $this->configuration ['page_menu_target'] = $form_state->getValue ('page_menu_target');
    $this->configuration ['page_menu_margin'] = $form_state->getValue ('page_menu_margin');
    $this->configuration ['page_menu_header_margin'] = $form_state->getValue ('page_menu_header_margin');
    $this->configuration ['page_menu_min_num_items'] = $form_state->getValue ('page_menu_min_num_items');
  }

  /**
   * {@inheritdoc}
   */
  public function build () {
    // Get the current page title.
    $request = \Drupal::request ();
    $title = \Drupal::service('path.matcher')->isFrontPage() ?
      \Drupal::config ('system.site')->get ('name') :
      \Drupal::service ('title_resolver')->getTitle ($request,
        \Drupal::service ('current_route_match')->getCurrentRouteMatch ()->getRouteObject ());

    return array (
      '#attached' => array (
        'library' => array ('page_menu/page_menu_library')
      ),
      '#cache'                   => array ('max-age' => 0),
      '#theme'                   => 'page_menu',
      '#page_menu_title'         => $this->label (),
      '#page_menu_page_title'    => $title,
      '#page_menu_target'        => $this->configuration ['page_menu_target'],
      '#page_menu_margin'        => $this->configuration ['page_menu_margin'],
      '#page_menu_header_margin' => $this->configuration ['page_menu_header_margin'],
      '#page_menu_min_num_items' => $this->configuration ['page_menu_min_num_items']
    );
  }
}
