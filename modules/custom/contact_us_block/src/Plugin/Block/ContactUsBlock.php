<?php
namespace Drupal\contact_us_block\Plugin\Block;
use Drupal\Core\Block\BlockBase;

/**
 * The Contact Us Block module defines a block
 * that presents users with a Contact Us and Sign
 * In/Sign Out link.
 *
 * @Block(
 *   id = "contact_us_block",
 *   admin_label = @Translation("Contact Us block")
 * )
 */
class ContactUsBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build () {
    $user = \Drupal::currentUser ();
    $logged_in = $user->isAuthenticated ();
    return [
      '#attached' => [
        'library' => ['contact_us_block/contact_us_block_library'],
        'drupalSettings' => []
      ],
      '#cache' => ['max-age' => 0],
      '#theme' => 'contact_us_block',
      '#logged_in' => $logged_in
    ];
  }
}
