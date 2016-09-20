<?php
/**
 * @file
 * Contains \Drupal\share_this_page\ShareThisPageSettingsForm
 */
namespace Drupal\share_this_page;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ShareThisPageSettingsForm extends ConfigFormBase {
  /** 
   * {@inheritdoc}
   */
  public function getFormId () {
    return 'share_this_page_admin_settings';
  }

  /** 
   * {@inheritdoc}
   */
  protected function getEditableConfigNames () {
    return [
      'share_this_page.settings',
    ];
  }

  /** 
   * {@inheritdoc}
   */
  public function buildForm (array $form, FormStateInterface $form_state) {
    $config = $this->config ('share_this_page.settings');
    $form['share_this_page_label'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Ribbon Label'),
      '#default_value' => $config->get ('share_this_page_label')
    );  
    return parent::buildForm ($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm (array &$form, FormStateInterface $form_state) {
    $this->config ('share_this_page.settings')
      ->set ('share_this_page_label',    $form_state->getValue ('share_this_page_label'))
      ->save ();
    parent::submitForm ($form, $form_state);
  }
}
