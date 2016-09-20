<?php
/**
 * Defines the Share This Page block which
 * creates a ribbon element containing social media
 * links that, when clicked, share the containing
 * page via social media sites.
 *
 * @Block(
 *   id = "share_this_page_block",
 *   admin_label = @Translation("Share This Page block")
 * )
 */
namespace Drupal\share_this_page\Plugin\Block;
use Drupal\Core\Block\BlockBase;

class ShareThisPageBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build () {
    $config = \Drupal::config ('share_this_page.settings');

    // Get the current (possibly aliased) page url.
    global $base_url;
    $url = $base_url . \Drupal::service ('path.alias_manager')->getAliasByPath (
             \Drupal::service ('path.current')->getPath ());
    
    // Get the current page title.
    $request = \Drupal::request ();
    $title = \Drupal::service('path.matcher')->isFrontPage() ?
      \Drupal::config ('system.site')->get ('name') :
      \Drupal::service ('title_resolver')->getTitle ($request,
        \Drupal::service ('current_route_match')->getCurrentRouteMatch ()->getRouteObject ());

    return array (
      '#attached' => array (
        'library' => array ('share_this_page/share_this_page_library'),
        'drupalSettings' => array (
          'share_this_page' => array (
            'label' => $config->get ('share_this_page_label'),
            'module_path' => base_path () . drupal_get_path('module', 'share_this_page')
        ))
      ),
      // disable caching so that setting updates will take immediate effect. 
      '#cache' => array ('max-age' => 0),
      '#theme' => 'share_this_page',
      // set template variables declared in the theme function.
      '#page' => array (
        'url' => $url,
        'title' => $title,
        'url_encoded_url'   => urlencode ($url),
        'url_encoded_title' => urlencode ($title)
      )
    );
  }
}
