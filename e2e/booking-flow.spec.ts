import { test, expect, TEST_SALON_SLUG } from './fixtures/auth';

/**
 * Tests del flujo de reserva (BookingFlow) — flujo crítico de conversión B2C.
 * Usa storageState de clienta (project: customer — chromium).
 * Precondición: demo-salon tiene al menos 1 servicio y 1 staff activos (seed).
 */
test.describe('Booking Flow — autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    // Esperar a que la página cargue (heading del salón visible)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('muestra los 4 pasos del wizard', async ({ page }) => {
    // Los step labels son sm:inline — siempre presentes en el DOM, visibles a 1280px
    await expect(page.getByText('Tus servicios').first()).toBeVisible();
    await expect(page.getByText('Profesional').first()).toBeVisible();
    await expect(page.getByText('Fecha y hora').first()).toBeVisible();
    await expect(page.getByText('Resumen').first()).toBeVisible();
  });

  test('el botón continuar está deshabilitado sin servicio seleccionado', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Continuar a Profesional/i });
    await expect(btn).toBeDisabled();
  });

  test('paso 1: seleccionar servicio habilita el botón continuar', async ({ page }) => {
    // Los servicios son divs clickeables (no botones con "Agregar")
    await page.locator('div.rounded-xl.cursor-pointer').first().click();
    const btn = page.getByRole('button', { name: /Continuar a Profesional/i });
    await expect(btn).toBeEnabled();
  });

  test('paso 1 → paso 2: navegar a profesional', async ({ page }) => {
    await page.locator('div.rounded-xl.cursor-pointer').first().click();
    await page.getByRole('button', { name: /Continuar a Profesional/i }).click();
    // UI shows "Paso 2: Elige a tu profesional" (imperative, not past tense)
    await expect(page.getByText(/Elige a tu profesional/i)).toBeVisible();
  });
});

test.describe('Booking Flow — sin autenticación', () => {
  test('la página de reserva es pública (acepta invitadas)', async ({ browser }) => {
    // Crear contexto limpio sin storageState
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    // BookingFlow allows guest bookings — the page loads and shows the wizard,
    // it does NOT redirect to /login. Guest data is collected at step 4 (Resumen).
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Tus servicios').first()).toBeVisible();
    await context.close();
  });
});
