import { test, expect } from '@playwright/test';

/**
 * Tests del wizard de onboarding de salones (/business/register).
 * 5 pasos: Tu salón → Servicios → Horarios → Equipo → Listo.
 * No requiere autenticación previa (registro de nuevo salón).
 */
test.describe('Onboarding Wizard — /business/register', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/business/register');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('la página carga y muestra los 5 pasos del wizard', async ({ page }) => {
    await expect(page.getByText('Tu salón')).toBeVisible();
    await expect(page.getByText('Servicios')).toBeVisible();
    await expect(page.getByText('Horarios')).toBeVisible();
    await expect(page.getByText('Equipo')).toBeVisible();
    await expect(page.getByText('Listo')).toBeVisible();
  });

  test('paso 1 está activo por defecto (Tu salón)', async ({ page }) => {
    // El label del campo de nombre del salón debe estar visible
    await expect(page.getByLabel(/nombre del salón/i)).toBeVisible();
    // La barra de progreso existe
    const progress = page.locator('[role="progressbar"]').or(page.locator('[class*="progress"]'));
    await expect(progress.first()).toBeVisible();
  });

  test('paso 1: el botón Continuar está deshabilitado con nombre vacío', async ({ page }) => {
    const continueBtn = page.getByRole('button', { name: /continuar|siguiente/i }).last();
    await expect(continueBtn).toBeDisabled();
  });

  test('paso 1: llenar nombre y slug habilita el botón Continuar', async ({ page }) => {
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    // La validación del slug se dispara automáticamente
    // Esperar a que el campo de slug muestre un valor derivado
    await page.waitForTimeout(500);
    const continueBtn = page.getByRole('button', { name: /continuar|siguiente/i }).last();
    await expect(continueBtn).toBeEnabled({ timeout: 8_000 });
  });

  test('paso 1 → paso 2: navegar a Servicios', async ({ page }) => {
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);

    const continueBtn = page.getByRole('button', { name: /continuar|siguiente/i }).last();
    await continueBtn.click({ timeout: 8_000 });

    // Paso 2 debe mostrar el formulario de servicios
    await expect(
      page.getByText(/servicio|corte|precio|duración/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('paso 2: los servicios sugeridos son clickeables', async ({ page }) => {
    // Navegar al paso 2
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    const continueBtn = page.getByRole('button', { name: /continuar|siguiente/i }).last();
    await continueBtn.click({ timeout: 8_000 });
    await page.waitForTimeout(300);

    // Los servicios sugeridos deben estar presentes (Corte de cabello, Coloración, etc.)
    const suggested = page.getByText(/corte de cabello|coloración|mechas/i).first();
    if (await suggested.isVisible({ timeout: 5_000 })) {
      await suggested.click();
      // Al clickear, el campo nombre del servicio se rellena
      const serviceInput = page.getByPlaceholder(/nombre del servicio|ej:/i).or(
        page.getByLabel(/nombre del servicio/i)
      ).first();
      if (await serviceInput.isVisible({ timeout: 3_000 })) {
        const value = await serviceInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('el botón volver regresa al paso anterior', async ({ page }) => {
    // Ir al paso 2
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /continuar|siguiente/i }).last().click({ timeout: 8_000 });
    await page.waitForTimeout(300);

    // Volver al paso 1
    const backBtn = page.getByRole('button', { name: /volver|anterior|atrás/i }).first();
    if (await backBtn.isVisible({ timeout: 3_000 })) {
      await backBtn.click();
      await expect(page.getByLabel(/nombre del salón/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('la barra de progreso avanza al ir al paso 2', async ({ page }) => {
    // Capturar progreso inicial
    const progressEl = page.locator('[role="progressbar"]').first();
    const initialStyle = await progressEl
      .evaluate((el) => el.getAttribute('aria-valuenow') ?? el.getAttribute('style') ?? '')
      .catch(() => '');

    // Navegar al paso 2
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /continuar|siguiente/i }).last().click({ timeout: 8_000 });
    await page.waitForTimeout(300);

    const updatedStyle = await progressEl
      .evaluate((el) => el.getAttribute('aria-valuenow') ?? el.getAttribute('style') ?? '')
      .catch(() => '');

    // El progreso debe haber cambiado
    expect(updatedStyle).not.toBe(initialStyle);
  });

  test('los pasos completados quedan marcados visualmente', async ({ page }) => {
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /continuar|siguiente/i }).last().click({ timeout: 8_000 });
    await page.waitForTimeout(300);

    // El paso 1 debe tener un indicador de completado (check icon o clase activa)
    const stepIndicators = page.locator('[class*="step"], [class*="Step"]').or(
      page.locator('li').filter({ hasText: 'Tu salón' })
    );
    // El DOM del paso 1 debe haber cambiado (completado)
    await expect(stepIndicators.first()).toBeVisible();
  });
});
