import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseIndexes1729443600000 implements MigrationInterface {
  name = 'AddDatabaseIndexes1729443600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Labels table - Foreign key indexes
    await queryRunner.query(`
      CREATE INDEX "idx_labels_product_id" ON "labels"("productId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_labels_template_id" ON "labels"("templateId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_labels_created_by_id" ON "labels"("createdById")
    `);

    // Labels table - Frequently filtered fields
    await queryRunner.query(`
      CREATE INDEX "idx_labels_status" ON "labels"("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_labels_label_type" ON "labels"("labelType")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_labels_created_at" ON "labels"("createdAt")
    `);

    // Composite indexes for common query patterns
    await queryRunner.query(`
      CREATE INDEX "idx_labels_product_status" ON "labels"("productId", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_labels_created_by_status" ON "labels"("createdById", "status")
    `);

    // Products table
    await queryRunner.query(`
      CREATE INDEX "idx_products_product_code" ON "products"("productCode")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_status" ON "products"("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_products_created_at" ON "products"("createdAt")
    `);

    // Products table - Full-text search support
    await queryRunner.query(`
      CREATE INDEX "idx_products_product_name" ON "products"("productName")
    `);

    // Audit logs - for performance and compliance
    await queryRunner.query(`
      CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entityType", "entityId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action")
    `);

    // LabelSpecifications - Foreign key
    await queryRunner.query(`
      CREATE INDEX "idx_label_specifications_label_id" ON "label_specifications"("labelId")
    `);

    // Templates - Common filters
    await queryRunner.query(`
      CREATE INDEX "idx_label_templates_type" ON "label_templates"("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_label_templates_is_active" ON "label_templates"("isActive")
    `);

    // Settings - Key lookup
    await queryRunner.query(`
      CREATE INDEX "idx_settings_key" ON "settings"("key")
    `);

    // Analyze tables for query planner optimization
    await queryRunner.query(`ANALYZE labels`);
    await queryRunner.query(`ANALYZE products`);
    await queryRunner.query(`ANALYZE audit_logs`);
    await queryRunner.query(`ANALYZE label_specifications`);
    await queryRunner.query(`ANALYZE label_templates`);
    await queryRunner.query(`ANALYZE settings`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_settings_key"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_label_templates_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_label_templates_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_label_specifications_label_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_timestamp"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_logs_entity"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_product_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_product_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_created_by_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_product_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_label_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_created_by_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_template_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_labels_product_id"`);
  }
}
