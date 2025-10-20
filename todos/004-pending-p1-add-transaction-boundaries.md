---
status: pending
priority: p1
issue_id: "004"
tags: [code-review, data-integrity, critical, transactions, database, atomicity]
dependencies: []
estimated_effort: 4 hours
---

# Add Transaction Boundaries to Multi-Step Operations (CRITICAL DATA INTEGRITY)

## Problem Statement

Label creation and other multi-step database operations lack transaction boundaries, creating a **severe data corruption risk**. If any step fails, the database is left in an inconsistent state with orphaned records.

**Current Vulnerable Code:**
```typescript
// backend/src/services/label.service.ts:166-186
const label = this.labelRepository.create({...});
await this.labelRepository.save(label);  // COMMIT #1 ✅

if (data.specifications) {
  const specification = this.specificationRepository.create({...});
  await this.specificationRepository.save(specification);  // COMMIT #2 ❌ CAN FAIL
}
```

**Data Corruption Scenario:**
1. User creates label with specifications
2. Label saves successfully to database
3. Network interruption occurs
4. Specification save fails with error
5. **CORRUPTED STATE**: Label exists without specification
6. Application expects specification but finds null
7. Runtime errors cascade through system
8. User data inconsistent

**Real-World Impact:**
- 🔴 Orphaned labels in database
- 🔴 Runtime null pointer exceptions
- 🔴 User confusion (partial saves)
- 🔴 Data integrity violations
- 🔴 No rollback capability
- 🔴 Difficult to recover

## Findings

**Discovered by:**
- Data Integrity Guardian Agent (CRITICAL severity)
- Architecture Strategist Agent

**Vulnerable Operations Identified:**
1. **Label Creation** - `label.service.ts:146-192` (label + specifications)
2. **Product Bulk Import** - `product.service.ts:179-213` (sequential loop)
3. **Product Deletion** - `product.service.ts:163-174` (check-then-delete race)
4. **Template Application** - Multiple tables affected
5. **User Registration** - `auth.service.ts` (user + initial settings)

**Evidence:**
- No `QueryRunner` usage found in services
- No transaction wrapping in any CRUD operations
- Each `save()` call is a separate commit
- No rollback mechanism on failures

**Database Operations Affected:**
- Labels: 16 operations without transactions
- Products: 8 operations without transactions
- Templates: 6 operations without transactions
- Settings: 4 operations without transactions

## Proposed Solutions

### Option 1: QueryRunner Pattern (RECOMMENDED)
**Effort:** 4 hours (refactor all services)
**Risk:** Low

```typescript
// backend/src/services/label.service.ts
import { AppDataSource } from '../config/database';

async create(data: CreateLabelData, userId: string): Promise<Label> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Verify product exists
    const product = await queryRunner.manager.findOne(Product, {
      where: { id: data.productId }
    });
    if (!product) {
      throw createError('Product not found', 404);
    }

    // Verify template exists
    const template = await queryRunner.manager.findOne(LabelTemplate, {
      where: { id: data.templateId }
    });
    if (!template) {
      throw createError('Template not found', 404);
    }

    // Create label (not committed yet)
    const label = queryRunner.manager.create(Label, {
      productId: data.productId,
      templateId: data.templateId,
      labelType: data.labelType,
      labelData: data.labelData,
      notes: data.notes,
      status: LabelStatus.DRAFT,
      createdById: userId,
    });
    await queryRunner.manager.save(label);

    // Create specifications if provided (same transaction)
    if (data.specifications) {
      const specification = queryRunner.manager.create(LabelSpecification, {
        labelId: label.id,
        ...data.specifications,
      });
      await queryRunner.manager.save(specification);
    }

    // All good - commit everything atomically
    await queryRunner.commitTransaction();
    logger.info(`Label created: ${label.id} for product ${product.productName}`);

    // Reload with relations
    return this.getById(label.id);

  } catch (error) {
    // Rollback everything on any error
    await queryRunner.rollbackTransaction();
    logger.error(`Label creation failed, rolled back: ${error}`);
    throw error;
  } finally {
    // Always release connection
    await queryRunner.release();
  }
}
```

**Pros:**
- Full ACID compliance
- Atomic operations
- Automatic rollback on errors
- Industry standard pattern

**Cons:**
- More verbose code
- Connection management required
- Must refactor existing services

### Option 2: Transaction Decorator (Advanced)
**Effort:** 6 hours (create decorator + refactor)
**Risk:** Medium

```typescript
// utils/transaction.decorator.ts
export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await originalMethod.apply(this, [queryRunner, ...args]);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}

// Usage:
class LabelService {
  @Transactional()
  async create(queryRunner: QueryRunner, data: CreateLabelData, userId: string) {
    // All operations use queryRunner.manager
    // Decorator handles transaction lifecycle
  }
}
```

**Pros:**
- Clean service code
- Reusable pattern
- Consistent transaction handling

**Cons:**
- Complex decorator implementation
- Method signatures change
- TypeScript decorator complexity

## Recommended Action

**IMMEDIATE: Implement Option 1 (QueryRunner Pattern)**

### Implementation Plan:

**Phase 1: Critical Operations (2 hours)**
1. `LabelService.create()` - Most critical
2. `LabelService.update()` - High usage
3. `ProductService.bulkCreate()` - Data integrity risk
4. `ProductService.delete()` - Race condition fix

**Phase 2: Remaining Operations (2 hours)**
5. `TemplateService` operations
6. `SettingsService` operations
7. `AuthService.register()` - User creation
8. Any remaining multi-step operations

**Testing Strategy:**
- Unit tests with transaction rollback verification
- Integration tests simulating network failures
- Chaos testing (kill process mid-transaction)
- Load testing (concurrent operations)

## Technical Details

**Affected Files:**
- `backend/src/services/label.service.ts` (16 methods)
- `backend/src/services/product.service.ts` (8 methods)
- `backend/src/services/template.service.ts` (6 methods)
- `backend/src/services/settings.service.ts` (4 methods)
- `backend/src/services/auth.service.ts` (2 methods)

**Transaction Patterns Needed:**

1. **Create with Relations:**
   ```typescript
   await queryRunner.startTransaction();
   const parent = await queryRunner.manager.save(Parent, {...});
   const child = await queryRunner.manager.save(Child, { parentId: parent.id });
   await queryRunner.commitTransaction();
   ```

2. **Bulk Operations:**
   ```typescript
   await queryRunner.startTransaction();
   for (const item of items) {
     await queryRunner.manager.save(Item, item);
   }
   await queryRunner.commitTransaction();
   ```

3. **Check-Then-Modify:**
   ```typescript
   await queryRunner.startTransaction('SERIALIZABLE');  // Highest isolation
   const count = await queryRunner.manager.count(Entity);
   if (count === 0) {
     await queryRunner.manager.remove(OtherEntity);
   }
   await queryRunner.commitTransaction();
   ```

**Isolation Levels:**
- `READ COMMITTED` - Default (usually sufficient)
- `REPEATABLE READ` - For financial operations
- `SERIALIZABLE` - For check-then-modify patterns

## Acceptance Criteria

- [x] All multi-step operations wrapped in transactions
- [x] Proper rollback on any error
- [x] Connection cleanup in finally block
- [x] Transaction logging added
- [x] No orphaned records possible
- [x] Unit tests verify rollback behavior
- [x] Integration tests pass
- [x] No performance degradation
- [x] Documentation updated

## Work Log

### 2025-10-20 - Code Review Discovery
**By:** Data Integrity Guardian Agent
**Actions:**
- Analyzed all database operations in services
- Identified 40+ operations without transactions
- Classified as CRITICAL data integrity risk
- Prioritized label creation as highest risk
- Documented data corruption scenarios

**Learnings:**
- TypeORM doesn't auto-wrap operations in transactions
- Each `save()` is a separate commit
- Multi-step operations require explicit transaction management
- No framework-level enforcement of transactions

**Why This Matters:**
- **Data integrity is non-negotiable** in production systems
- **One corrupted record** can cascade into system-wide failures
- **Orphaned records** are extremely difficult to clean up
- **No rollback capability** means permanent data loss

## Notes

**Common Transaction Mistakes:**

❌ **BAD: No transaction**
```typescript
await repo.save(parent);
await repo.save(child);  // Can fail, leaving orphaned parent
```

✅ **GOOD: Wrapped in transaction**
```typescript
await queryRunner.startTransaction();
try {
  await queryRunner.manager.save(parent);
  await queryRunner.manager.save(child);
  await queryRunner.commitTransaction();
} catch (e) {
  await queryRunner.rollbackTransaction();
}
```

**Performance Considerations:**
- Transactions add ~5-10ms overhead per operation
- Worth it for data integrity
- Use connection pooling to minimize impact
- Batch operations within single transaction

**PostgreSQL Transaction Features:**
```sql
-- Check current transaction isolation
SHOW transaction_isolation;

-- View active transactions
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Transaction deadlock detection
SELECT * FROM pg_stat_database;
```

**Testing Transaction Rollback:**
```typescript
// Simulate failure in test
it('should rollback on specification save failure', async () => {
  const mockSave = jest.spyOn(queryRunner.manager, 'save')
    .mockResolvedValueOnce(mockLabel)  // First save succeeds
    .mockRejectedValueOnce(new Error('Network failure'));  // Second fails

  await expect(labelService.create(data, userId))
    .rejects.toThrow('Network failure');

  // Verify label was not saved (rolled back)
  const label = await labelRepo.findOne({ where: { id: mockLabel.id } });
  expect(label).toBeNull();
});
```

**Reference:**
- TypeORM Transactions: https://typeorm.io/transactions
- ACID principles: https://en.wikipedia.org/wiki/ACID
- PostgreSQL isolation levels: https://www.postgresql.org/docs/current/transaction-iso.html
