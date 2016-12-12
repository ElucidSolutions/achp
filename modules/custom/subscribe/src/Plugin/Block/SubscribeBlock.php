<?php
/**
 * @file
 * Defines the Subscribe block class which
 * represents Subscribe blocks.
 */

namespace Drupal\subscribe\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * The Subscribe module defines the Subscribe
 * blocks which users can use to subscribe to
 * ACHP's newsletters.
 *
 * @Block(
 *   id = "subscribe",
 *   admin_label = @Translation("Subscribe block")
 * )
 */
class SubscribeBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration () {
    return [
      'subscribe_url' => '',
      'subscribe_submit_label' => ''
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm ($form, FormStateInterface $form_state) {
    $form ['subscribe_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t ('Subscribe URL'),
      '#default_value' => $this->configuration ['subscribe_url'],
      '#required' => true,
      '#description' => $this->t ('The URL that subscription requests should be sent to.')
    ];
    $form ['subscribe_submit_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t ('Submit Label'),
      '#default_value' => $this->configuration ['subscribe_submit_label'],
      '#required' => true,
      '#description' => $this->t ('The text used to label the submit button.')
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit ($form, FormStateInterface $form_state) {
    $this->configuration ['subscribe_url'] = $form_state->getValue ('subscribe_url');
    $this->configuration ['subscribe_submit_label'] = $form_state->getValue ('subscribe_submit_label');
  }

  /**
   * {@inheritdoc}
   */
  public function build () {
    return [
      '#cache' => ['max-age' => 0],
      '#theme' => 'subscribe',
      '#subscribe' => [
        'url' => $this->configuration ['subscribe_url'],
        'submit_label' => $this->configuration ['subscribe_submit_label']
      ]
    ];
  }
}
