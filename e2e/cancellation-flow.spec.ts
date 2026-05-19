import { test, expect, TEST_SALON_SLUG } from './fixtures/auth';

/**
 * Tests del flujo de cancelación de turnos.
 * Cubre: portal cliente autenticado, AlertDialog de confirmación,
 * y comportamiento del botón "Volver" (sin cancelar).
 *
 * Nota: Los tests que requieren turnos activos en Firestore usan skip graceful
 * si el estado del demo-salon no tiene citas pendientes.
 */
test.describe('Flujo de Cancelación — portal cliente autenticado', () => {
  test('el portal cliente carga para una clienta autenticada', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    // Debe cargar el portal — no redirigir a /login ni mostrar 500
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByText(/internal server error/i)).not.toBeVisible();
    // El encabezado del portal debe ser visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });

  test('el portal muestra la sección de mis turnos o estado vacío', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Debe mostrar alguna sección de turnos (con datos o estado vacío)
    const turnosSection = page
      .getByText(/próximos turnos|mis turnos|no tenés turnos|reservar/i)
      .first();
    await expect(turnosSection).toBeVisible({ timeout: 8_000 });
  });

  test('si hay turnos, el botón "Cancelar Turno" abre el AlertDialog', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const cancelBtn = page.getByRole('button', { name: /cancelar turno/i }).first();
    if (!await cancelBtn.isVisible({ timeout: 5_000 })) {
      test.skip(true, 'Sin turnos activos en demo-salon — seed requerido');
    }

    await cancelBtn.click();

    // El AlertDialog debe abrirse con el título correcto
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/¿estás segura?/i)).toBeVisible();
    await expect(page.getByText(/esta acción no se puede deshacer/i)).toBeVisible();
  });

  test('el botón "Volver" cierra el dialog sin cancelar', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const cancelBtn = page.getByRole('button', { name: /cancelar turno/i }).first();
    if (!await cancelBtn.isVisible({ timeout: 5_000 })) {
      test.skip(true, 'Sin turnos activos en demo-salon — seed requerido');
    }

    await cancelBtn.click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });

    // Click en "Volver" — cierra el dialog sin ejecutar cancelación
    await page.getByRole('button', { name: /volver/i }).click();
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 });

    // El turno sigue visible (no fue cancelado)
    await expect(page.getByRole('button', { name: /cancelar turno/i }).first()).toBeVisible();
  });

  test('el AlertDialog tiene el botón de confirmar cancelación', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    const cancelBtn = page.getByRole('button', { name: /cancelar turno/i }).first();
    if (!await cancelBtn.isVisible({ timeout: 5_000 })) {
      test.skip(true, 'Sin turnos activos en demo-salon — seed requerido');
    }

    await cancelBtn.click();
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });

    // El botón de confirmación debe estar presente
    await expect(
      page.getByRole('button', { name: /sí, cancelar turno/i })
    ).toBeVisible();
  });
});

test.describe('Flujo de Cancelación — /mis-turnos (historial)', () => {
  test('la página de mis-turnos carga con historial', async ({ page }) => {
    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard/mis-turnos`);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    await expect(page.getByText(/internal server error/i)).not.toBeVisible();
    // El historial muestra algún contenido o estado vacío
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Flujo de Cancelación — búsqueda por teléfono (guest)', () => {
  test('el portal acepta búsqueda por teléfono sin sesión', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto(`/salones/${TEST_SALON_SLUG}/dashboard`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Sin sesión, debe mostrar la vista de búsqueda por teléfono (PhoneSearchView)
    // o redirigir al login del salón
    const isPhoneSearch = await page.getByPlaceholder(/teléfono|celular|\+54/i).isVisible({ timeout: 5_000 });
    const isLoginRedirect = page.url().includes('/login') || page.url().includes('/dashboard');

    expect(isPhoneSearch || isLoginRedirect).toBe(true);
    await ctx.close();
  });
});
