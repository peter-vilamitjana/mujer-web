/**
 * Auth fixture — expone helpers y el slug del salón de prueba.
 * La autenticación se gestiona via storageState (generado en global-setup.ts),
 * no con login en cada test.
 */
import { test as base, expect, type Page } from '@playwright/test';

export const TEST_SALON_SLUG =
  process.env.E2E_TEST_SALON_SLUG ?? 'demo-salon';

export type AuthFixtures = {
  testSalonSlug: string;
  authenticatedPage: Page;
  customerPage: Page;
};

export const test = base.extend<AuthFixtures>({
  testSalonSlug: async ({}, use) => {
    await use(TEST_SALON_SLUG);
  },
  // En los proyectos admin/customer, storageState ya está aplicado en el context
  authenticatedPage: async ({ page }, use) => {
    await use(page);
  },
  customerPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect };
