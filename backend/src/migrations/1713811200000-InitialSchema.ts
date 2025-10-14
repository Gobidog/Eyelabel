import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1713811200000 implements MigrationInterface {
  name = 'InitialSchema1713811200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('engineer','designer','approver','admin')`);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'engineer',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastLoginAt" TIMESTAMP,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "gs1BarcodeNumber" character varying(20) NOT NULL,
        "productCode" character varying(20) NOT NULL,
        "productName" character varying(200) NOT NULL,
        "description" text,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("gs1BarcodeNumber")
      )
    `);

    await queryRunner.query(`CREATE TYPE "public"."label_templates_type_enum" AS ENUM('standard','cct_selectable','power_selectable','emergency')`);
    await queryRunner.query(`
      CREATE TABLE "label_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "type" "public"."label_templates_type_enum" NOT NULL,
        "templateData" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_label_templates_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE TYPE "public"."labels_labeltype_enum" AS ENUM('product','carton')`);
    await queryRunner.query(`CREATE TYPE "public"."labels_status_enum" AS ENUM('draft','in_design','review','approved','sent')`);
    await queryRunner.query(`
      CREATE TABLE "labels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "labelType" "public"."labels_labeltype_enum" NOT NULL,
        "status" "public"."labels_status_enum" NOT NULL DEFAULT 'draft',
        "labelData" jsonb NOT NULL,
        "pdfUrl" text,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "approvedAt" TIMESTAMP,
        "productId" uuid NOT NULL,
        "templateId" uuid,
        "createdById" uuid,
        "approvedById" uuid,
        CONSTRAINT "PK_labels_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "labels"
      ADD CONSTRAINT "FK_labels_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "labels"
      ADD CONSTRAINT "FK_labels_template" FOREIGN KEY ("templateId") REFERENCES "label_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "labels"
      ADD CONSTRAINT "FK_labels_created_by" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "labels"
      ADD CONSTRAINT "FK_labels_approved_by" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "label_specifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "powerInput" character varying(100),
        "temperatureRating" character varying(50),
        "ipRating" character varying(10),
        "cctOptions" character varying(100),
        "powerOptions" character varying(100),
        "opticType" character varying(50),
        "classRating" character varying(50),
        "additionalSpecs" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "labelId" uuid NOT NULL,
        CONSTRAINT "REL_label_specifications_label" UNIQUE ("labelId"),
        CONSTRAINT "PK_label_specifications_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "label_specifications"
      ADD CONSTRAINT "FK_label_specifications_label" FOREIGN KEY ("labelId") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('create','update','delete','approve','reject','send')`);
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entityType" character varying(50) NOT NULL,
        "entityId" uuid NOT NULL,
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "userId" uuid,
        "changes" jsonb,
        "notes" text,
        "ipAddress" inet,
        "userAgent" text,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_user"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);

    await queryRunner.query(`ALTER TABLE "label_specifications" DROP CONSTRAINT "FK_label_specifications_label"`);
    await queryRunner.query(`DROP TABLE "label_specifications"`);

    await queryRunner.query(`ALTER TABLE "labels" DROP CONSTRAINT "FK_labels_approved_by"`);
    await queryRunner.query(`ALTER TABLE "labels" DROP CONSTRAINT "FK_labels_created_by"`);
    await queryRunner.query(`ALTER TABLE "labels" DROP CONSTRAINT "FK_labels_template"`);
    await queryRunner.query(`ALTER TABLE "labels" DROP CONSTRAINT "FK_labels_product"`);
    await queryRunner.query(`DROP TABLE "labels"`);
    await queryRunner.query(`DROP TYPE "public"."labels_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."labels_labeltype_enum"`);

    await queryRunner.query(`DROP TABLE "label_templates"`);
    await queryRunner.query(`DROP TYPE "public"."label_templates_type_enum"`);

    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
