import { describe, it, expect } from 'vitest';
import { COMPONENT_CATALOG } from '../../catalog';
import { validateCatalog } from '../validator';

describe('Component Library Physical Validation Suite', () => {
  it('validates all catalog components against physical-first standards', () => {
    const report = validateCatalog(COMPONENT_CATALOG as any);
    console.log(`Validation summary: ${report.validCount}/${report.totalComponents} valid components.`);

    if (!report.allValid) {
      const invalidItems = report.items.filter((i) => i.status === 'INVALID');
      console.warn('Invalid components found:', invalidItems.map((i) => `${i.id}: missing [${i.missingFields.join(', ')}]`));
    }

    expect(report.invalidCount).toBe(0);
    expect(report.allValid).toBe(true);
  });
});
