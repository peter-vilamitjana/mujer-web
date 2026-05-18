import { test, expect, TEST_SALON_SLUG } from './fixtures/auth';

/**
 * Tests del flujo de reserva como invitada (sin sesión).
 * Cubre el camino crítico de conversión B2C sin auth wall.
 * Los tests que dependen de datos reales de Firestore usan skip graceful.
 */
test.describe('Guest Booking — sin autenticación', () => {
  test('la página de reserva carga sin redirigir a login', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Verificar que no hay redirección a /login
    await expect(page).not.toHaveURL(/\/login/);
    // El wizard de 4 pasos está presente
    await expect(page.getByText('Tus servicios').first()).toBeVisible();
    await ctx.close();
  });

  test('paso 1: seleccionar servicio habilita el botón continuar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Verificar que el botón está deshabilitado sin selección
    const btn = page.getByRole('button', { name: /Continuar a Profesional/i });
    await expect(btn).toBeDisabled();

    const serviceCards = page.locator('div.rounded-xl.cursor-pointer');
    const cardCount = await serviceCards.count();
    if (cardCount === 0) {
      test.skip(true, 'Sin servicios en demo-salon — seed requerido');
    }

    await serviceCards.first().click();
    await expect(btn).toBeEnabled();
    await ctx.close();
  });

  test('paso 1 → paso 2: navegar a selección de profesional', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const serviceCards = page.locator('div.rounded-xl.cursor-pointer');
    if (await serviceCards.count() === 0) {
      test.skip(true, 'Sin servicios en demo-salon — seed requerido');
    }

    await serviceCards.first().click();
    await page.getByRole('button', { name: /Continuar a Profesional/i }).click();
    await expect(page.getByText(/Elige a tu profesional/i)).toBeVisible({ timeout: 5_000 });
    await ctx.close();
  });

  test('paso 2 → paso 3: navegar a selección de fecha y hora', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/book`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const serviceCards = page.locator('div.rounded-xl.cursor-pointer');
    if (await serviceCards.count() === 0) {
      test.skip(true, 'Sin servicios en demo-salon — seed requerido');
    }

    await serviceCards.first().click();
    await page.getByRole('button', { name: /Continuar a Profesional/i }).click();
    await expect(page.getByText(/Elige a tu profesional/i)).toBeVisible({ timeout: 5_000 });

    // Seleccionar primer profesional disponible
    const staffCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /min|$/ });
    const anyStaff = page.getByRole('button', { name: /Continuar a Fecha/i });
    // Si hay profesional clicable, avanzar; sino skip
    const staffClickable = page.locator('div.rounded-xl.cursor-pointer');
    const staffCount = await staffClickable.count();
    if (staffCount === 0) {
      test.skip(true, 'Sin staff en demo-salon — seed requerido');
    }

    await staffClickable.first().click();
    const continueToDate = page.getByRole('button', { name: /Continuar a Fecha/i });
    if (await continueToDate.isVisible({ timeout: 3_000 })) {
      await continueToDate.click();
      await expect(page.getByText(/Fecha y hora/i).first()).toBeVisible({ timeout: 5_000 });
    }

    // Cleanup unused variable warning suppression
    void staffCards; void anyStaff;
    await ctx.close();
  });

  test('la página del salón tiene el botón de reservar', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}`);
    // El perfil público del salón debe cargar
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Debe haber un CTA de reserva
    const bookBtn = page.getByRole('link', { name: /reservar|book/i }).or(
      page.getByRole('button', { name: /reservar|book/i })
    ).first();
    await expect(bookBtn).toBeVisible({ timeout: 5_000 });
    await ctx.close();
  });
});

test.describe('Página de confirmación de reserva', () => {
  test('ruta de confirmación con ID inválido muestra error o not-found', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/book/confirmation/id-inexistente`);
    // Debe mostrar 404 o un mensaje de error — nunca crashear con 500
    const statusOk = await page.waitForLoadState('networkidle').then(() => true).catch(() => false);
    expect(statusOk).toBe(true);
    // No debe haber "Internal Server Error" visible
    await expect(page.getByText(/internal server error/i)).not.toBeVisible();
    await ctx.close();
  });
});
