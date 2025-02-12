<?php defined('BASEPATH') or exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * @webScheduler - Online Appointment Scheduler
 *
 * @package     @webScheduler
 * @author      N. Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webScheduler.co.za
 * @since       v1.4.0
 * ---------------------------------------------------------------------------- */

class Migration_Create_webhooks_table extends WS_Migration
{
    /**
     * Upgrade method.
     */
    public function up(): void
    {
        if (!$this->db->table_exists('webhooks')) {
            $this->dbforge->add_field([
                'id' => [
                    'type' => 'INT',
                    'constraint' => 11,
                    'auto_increment' => true,
                ],
                'create_datetime' => [
                    'type' => 'DATETIME',
                    'null' => true,
                ],
                'update_datetime' => [
                    'type' => 'DATETIME',
                    'null' => true,
                ],
                'delete_datetime' => [
                    'type' => 'DATETIME',
                    'null' => true,
                ],
                'name' => [
                    'type' => 'VARCHAR',
                    'constraint' => '256',
                    'null' => true,
                ],
                'url' => [
                    'type' => 'TEXT',
                    'null' => true,
                ],
                'actions' => [
                    'type' => 'TEXT',
                    'null' => true,
                ],
                'secret_token' => [
                    'type' => 'VARCHAR',
                    'constraint' => '512',
                    'null' => true,
                ],
                'is_ssl_verified' => [
                    'type' => 'TINYINT',
                    'constraint' => '4',
                    'default' => true,
                ],
                'notes' => [
                    'type' => 'TEXT',
                    'null' => true,
                ],
            ]);

            $this->dbforge->add_key('id', true);

            $this->dbforge->create_table('webhooks', true, ['engine' => 'InnoDB']);
        }
    }

    /**
     * Downgrade method.
     */
    public function down(): void
    {
        if ($this->db->table_exists('webhooks')) {
            $this->dbforge->drop_table('webhooks');
        }
    }
}
