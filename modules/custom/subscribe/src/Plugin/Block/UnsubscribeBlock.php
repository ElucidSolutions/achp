<?php
/**
 * @file
 * Defines the Unsubscribe block class which
 * represents the Unsubscribe blocks.
 */

namespace Drupal\subscribe\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * The Unsubscribe Block class represents the
 * Unsubscribe form blocks which users can use to
 * unsubscribe from ACHP newsletters.
 *
 * @Block(
 *   id = "unsubscribe",
 *   admin_label = @Translation("Unsubscribe block")
 * )
 */
class UnsubscribeBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration () {
    \Drupal::logger ('subscribe')->notice ('[UnsubscribeBlock::defaultConfiguration]');
    return [
      'unsubscribe_url' => '',
      'unsubscribe_submit_label' => ''
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm ($form, FormStateInterface $form_state) {
    \Drupal::logger ('subscribe')->notice ('[UnsubscribeBlock::blockForm]');
    $form ['unsubscribe_url'] = [
      '#type' => 'textfield',
      '#title' => $this->t ('Unsubscribe URL'),
      '#default_value' => $this->configuration ['unsubscribe_url'],
      '#required' => true,
      '#description' => $this->t ('The URL that unsubscribe requests should be sent to.')
    ];
    $form ['unsubscribe_submit_label'] = [
      '#type' => 'textfield',
      '#title' => $this->t ('Submit Label'),
      '#default_value' => $this->configuration ['unsubscribe_submit_label'],
      '#required' => true,
      '#description' => $this->t ('The text used to label the submit button.')
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit ($form, FormStateInterface $form_state) {
    \Drupal::logger ('subscribe')->notice ('[UnsubscribeBlock::blockSubmit]');
    $this->configuration ['unsubscribe_url'] = $form_state->getValue ('unsubscribe_url');
    $this->configuration ['unsubscribe_submit_label'] = $form_state->getValue ('unsubscribe_submit_label');
  }

  /**
   * {@inheritdoc}
   */
  public function build () {
    \Drupal::logger ('subscribe')->notice ('[UnsubscribeBlock::build]');
    return [
      '#cache' => ['max-age' => 0],
      '#theme' => 'unsubscribe',
      '#unsubscribe' => [
        'url' => $this->configuration ['unsubscribe_url'],
        'submit_label' => $this->configuration ['unsubscribe_submit_label']
      ]
    ];
  }
}
