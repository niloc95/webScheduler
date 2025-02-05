<?php defined('BASEPATH') or exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * @webScheduler - Online Appointment Scheduler
 *
 * @package     @webScheduler - Online Appointments
 * @author      N N.Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webscheduler.co.za
 * @since       v1.0.0
 * ---------------------------------------------------------------------------- */

if (!function_exists('session')) {
    /**
     * Get / set the specified session value.
     *
     * If an array is passed as the key, we will assume you want to set an array of values.
     *
     * Example "Get":
     *
     * $logged_in = session('logged_in', FALSE);
     *
     * Example "Set":
     *
     * session(['logged_in' => FALSE]);
     *
     * @param array|string|null $key Session item key.
     * @param mixed|null $default Default value in case the requested session item has no value.
     *
     * @return mixed|NULL Returns the requested value or NULL if you assign a new session value.
     *
     * @throws InvalidArgumentException
     */
    function session(array|string|null $key = null, mixed $default = null): mixed
    {
        /** @var EA_Controller $CI */
        $CI = &get_instance();

        if (empty($key)) {
            throw new InvalidArgumentException('The $key argument cannot be empty.');
        }

        if (is_array($key)) {
            foreach ($key as $item => $value) {
                $CI->session->set_userdata($item, $value);
            }

            return null;
        }

        $value = $CI->session->userdata($key);

        return $value ?? $default;
    }
}
