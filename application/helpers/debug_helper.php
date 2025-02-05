<?php use JetBrains\PhpStorm\NoReturn;

defined('BASEPATH') or exit('No direct script access allowed');

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

if (!function_exists('dd')) {
    /**
     * Output the provided variables with "var_dump" and stop the execution.
     *
     * Example:
     *
     * dd($appointment, $service, $provider, $customer);
     *
     * @param mixed ...$vars
     */
    #[NoReturn]
    function dd(...$vars): void
    {
        echo is_cli() ? PHP_EOL : '<pre>';
        var_dump($vars);
        echo is_cli() ? PHP_EOL : '</pre>';

        exit(1);
    }
}
