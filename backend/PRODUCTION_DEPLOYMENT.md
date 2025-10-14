# Production Deployment Guide

## Database Migration Strategy

### Current Setup (Development)

In development, the application uses TypeORM's `synchronize: true` which automatically creates/updates tables based on entity definitions. This is convenient for rapid development but **NOT SAFE** for production.

### Production Setup

For production, you **MUST** use migrations to ensure controlled, versioned database schema changes.

## Migration Files

### Initial Schema
- **File**: `src/migrations/1713811200000-InitialSchema.ts`
- **Status**: ✅ Complete and ready
- **Tables Created**:
  - users (with roles enum)
  - products (with GS1 barcode)
  - label_templates (with types enum)
  - labels (with status workflow)
  - label_specifications (one-to-one with labels)
  - audit_logs (complete audit trail)

## Pre-Production Checklist

### 1. Update Environment Configuration

Create a production `.env` file with:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CRITICAL: Disable synchronize in production
# This is handled in database.ts based on NODE_ENV
```

### 2. Run Migrations on Fresh Database

For a **new production database**:

```bash
# Inside backend directory
npm run migration:run
```

This will execute the InitialSchema migration and create all tables.

### 3. For Existing Development Database

If you're migrating from development (where tables already exist):

**Option A: Fresh Start (Recommended)**
1. Backup any important data
2. Drop the development database
3. Create new database
4. Run migrations: `npm run migration:run`
5. Restore data if needed

**Option B: Mark Migration as Run**
```bash
# Connect to database
psql -U labeluser -d labeldb

# Manually create migrations table and mark initial migration as run
CREATE TABLE IF NOT EXISTS "migrations" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" bigint NOT NULL,
  "name" varchar NOT NULL
);

INSERT INTO "migrations" ("timestamp", "name")
VALUES (1713811200000, 'InitialSchema1713811200000');
```

### 4. Verify Migration Status

```bash
npm run typeorm migration:show -- -d src/config/database.ts
```

Expected output:
```
[X] InitialSchema1713811200000  (ran)
```

## Future Schema Changes

When you need to modify the database schema:

### 1. Update Entity Files
Make changes to entity files in `src/entities/`

### 2. Generate Migration
```bash
npm run migration:generate -- -d src/config/database.ts -n DescriptiveNameOfChange
```

This compares entities to database and generates a migration with the differences.

### 3. Review Generated Migration
Always review the generated SQL before running it!

### 4. Run Migration
```bash
npm run migration:run -- -d src/config/database.ts
```

### 5. Rollback if Needed
```bash
npm run migration:revert -- -d src/config/database.ts
```

## Database Configuration

The `src/config/database.ts` file automatically adjusts based on environment:

**Development** (`NODE_ENV=development`):
- `synchronize: true` - Auto-creates/updates tables
- `logging: true` - Shows SQL queries
- Convenient but not safe for production

**Production** (`NODE_ENV=production`):
- `synchronize: false` - Uses migrations only
- `logging: false` - No query logging
- SSL enabled with `rejectUnauthorized: false`
- Safe and controlled schema changes

## Important Notes

1. **NEVER set `synchronize: true` in production** - This can cause data loss
2. **Always backup before migrations** - Especially in production
3. **Test migrations on staging first** - Never run untested migrations in production
4. **Keep migrations in version control** - They're part of your application code
5. **Migrations are sequential** - They run in order based on timestamp

## Rollback Strategy

If a migration fails or causes issues:

```bash
# Revert last migration
npm run migration:revert -- -d src/config/database.ts

# Revert multiple migrations (run command multiple times)
npm run migration:revert -- -d src/config/database.ts
npm run migration:revert -- -d src/config/database.ts
```

## Migration Best Practices

1. **One logical change per migration** - Don't mix unrelated changes
2. **Always provide `down()` method** - Enable rollbacks
3. **Use transactions** - Most migrations are wrapped in transactions automatically
4. **Test on copy of production data** - Catch issues before production
5. **Plan for zero-downtime** - Consider backwards compatibility
6. **Document complex migrations** - Add comments explaining why

## Monitoring

After running migrations in production:

1. Check application logs for errors
2. Verify critical queries still work
3. Check API endpoints functionality
4. Monitor performance metrics
5. Have rollback plan ready

## Emergency Procedures

If production breaks after migration:

1. **Immediate**: Revert the migration
   ```bash
   npm run migration:revert -- -d src/config/database.ts
   ```

2. **Verify**: Check application is working

3. **Investigate**: Review migration SQL and entity changes

4. **Fix**: Correct the migration locally

5. **Test**: Run on staging/copy of production

6. **Re-deploy**: With corrected migration

## Additional Resources

- TypeORM Migrations Docs: https://typeorm.io/migrations
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Database Backup Strategy: (add your backup docs here)

---

**Last Updated**: 2025-10-13
**Migration Version**: InitialSchema1713811200000
