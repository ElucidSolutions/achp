<?php
/**
 * @file
 * Contains \Drupal\event_calendar\EventCalendarSettingsForm
 */
namespace Drupal\event_calendar;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class EventCalendarSettingsForm extends ConfigFormBase {
  /** 
   * {@inheritdoc}
   */
  public function getFormId () {
    return 'event_calendar_admin_settings';
  }

  /** 
   * {@inheritdoc}
   */
  protected function getEditableConfigNames () {
    return [
      'event_calendar.settings',
    ];
  }

  /** 
   * {@inheritdoc}
   */
  public function buildForm (array $form, FormStateInterface $form_state) {
    $config = $this->config ('event_calendar.settings');
    $form['event_calendar_num_events'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Number of events to display'),
      '#default_value' => $config->get ('event_calendar_num_events')
    );  
    $form['event_calendar_google_client_id'] = array (
      '#type' => 'textfield',
      '#title' => $this->t ('Google API Client ID'),
      '#description' => $this->t ('Every app that accesses Google Calendar needs a client ID. See https://console.developers.google.com.'),
      '#default_value' => $config->get ('event_calendar_google_client_id')
    );  
    return parent::buildForm ($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm (array &$form, FormStateInterface $form_state) {
    $this->config ('event_calendar.settings')
      ->set ('event_calendar_num_events', $form_state->getValue ('event_calendar_num_events'))
      ->set ('event_calendar_google_client_id', $form_state->getValue ('event_calendar_google_client_id'))
      ->save ();
    parent::submitForm ($form, $form_state);
  }
}
