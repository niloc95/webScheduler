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

class Migration_Rename_service_categories_table_to_categories extends WS_Migration
{
    /**
     * Upgrade method.
     */
    public function up(): void
    {
        if ($this->db->table_exists('service_categories')) {
            $this->dbforge->rename_table('service_categories', 'categories');
        }
    }

    /**
     * Downgrade method.
     */
    public function down(): void
    {
        if ($this->db->table_exists('categories')) {
            $this->dbforge->rename_table('categories', 'service_categories');
        }
    }
}
