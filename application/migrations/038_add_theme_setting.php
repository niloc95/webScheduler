<?php defined('BASEPATH') or exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * @webScheduler - Online Appointment Scheduler
 *
 * @package     @webScheduler
 * @author      N. Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://@webScheduler.org
 * @since       v1.4.0
 * ---------------------------------------------------------------------------- */

class Migration_Add_theme_setting extends EA_Migration
{
    /**
     * Upgrade method.
     */
    public function up(): void
    {
        if (!$this->db->get_where('settings', ['name' => 'theme'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'theme',
                'value' => 'default',
            ]);
        }
    }

    /**
     * Downgrade method.
     */
    public function down(): void
    {
        if ($this->db->get_where('settings', ['name' => 'theme'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'theme']);
        }
    }
}
