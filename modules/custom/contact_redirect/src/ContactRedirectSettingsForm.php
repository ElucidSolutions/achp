<?php
/**
 * @file
 * Contains \Drupal\contact_redirect\ContactRedirectSettingsForm
 */
namespace Drupal\contact_redirect;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * @brief
 * Defines the settings form for the Contact
 * Redirect module.
 */
class ContactRedirectSettingsForm extends ConfigFormBase {
  /** 
   * {@inheritdoc}
   */
  public function getFormId () {
    return 'contact_redirect_admin_settings';
  }

  /** 
   * {@inheritdoc}
   */
  protected function getEditableConfigNames () {
    return [
      'contact_redirect.settings',
    ];
  }

  /** 
   * {@inheritdoc}
   */
  public function buildForm (array $form, FormStateInterface $form_state) {
    $config = $this->config ('contact_redirect.settings');
    $form ['url'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Redirect URL'),
      '#default_value' => $config->get ('url'),
      '#description' => $this->t ('The URL that users will be redirected to after they send a message using a contact form.')
    );
    return parent::buildForm ($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm (array &$form, FormStateInterface $form_state) {
    $this->config ('contact_redirect.settings')
      ->set ('url', $form_state->getValue ('url'))
      ->save ();

    parent::submitForm ($form, $form_state);
  }
}
