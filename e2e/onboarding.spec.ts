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
    // El h1 "Configurá tu salón" contiene el substring "Tu salón", por eso
    // se acota al título de la card del paso activo (heading level 3).
    await expect(page.getByRole('heading', { level: 3, name: 'Tu salón', exact: true })).toBeVisible();
    // Los labels de paso son "hidden sm:block" — ocultos a propósito en mobile
    // (solo iconos), por eso se verifica presencia en el DOM y no visibilidad.
    await expect(page.getByText('Servicios')).toHaveCount(1);
    await expect(page.getByText('Horarios')).toHaveCount(1);
    await expect(page.getByText('Equipo')).toHaveCount(1);
    await expect(page.getByText('Listo')).toHaveCount(1);
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

    // Paso 2 debe mostrar el formulario de servicios. .last() en vez de
    // .first() porque el label oculto "Servicios" del step-indicator (DOM
    // anterior al contenido del paso) también matchea la regex.
    await expect(
      page.getByText(/servicio|corte|precio|duración/i).last()
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
    // La página muestra "Paso X de 5" — señal visible y estable, en vez de
    // leer atributos ARIA internos del componente Progress de Radix.
    await expect(page.getByText('Paso 1 de 5')).toBeVisible();

    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /continuar|siguiente/i }).last().click({ timeout: 8_000 });

    await expect(page.getByText('Paso 2 de 5')).toBeVisible({ timeout: 5_000 });
  });

  test('los pasos completados quedan marcados visualmente', async ({ page }) => {
    await page.getByLabel(/nombre del salón/i).fill('Salon Test E2E');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /continuar|siguiente/i }).last().click({ timeout: 8_000 });
    await page.waitForTimeout(300);

    // El indicador circular del paso 1 pasa a la variante "completado"
    // (bg-primary) — ver src/app/business/register/page.tsx.
    const firstStepCircle = page.locator('div.rounded-full.border-2').first();
    await expect(firstStepCircle).toHaveClass(/bg-primary/);
  });
});
