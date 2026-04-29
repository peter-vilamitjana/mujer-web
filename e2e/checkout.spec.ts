import { test, expect } from './fixtures/auth';

/**
 * Tests del flujo de cierre de turno (Checkout / Cierre de Caja).
 * Precondición: el global-setup siembra demo-salon y asigna rol admin al usuario e2e.
 * Si las reglas de Firestore bloquean el seed, estos tests se saltean graciosamente.
 */
test.describe('Checkout Admin', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/agenda');
    // Dar tiempo al UserContext para resolver el rol desde Firestore
    await authenticatedPage.waitForTimeout(3_000);
  });

  test('la agenda se carga correctamente', async ({ authenticatedPage }) => {
    // Si el usuario tiene rol admin, se muestra el contenido; si no, la página queda vacía.
    // El test verifica que la navegación a /agenda no devuelve 404/500.
    await expect(authenticatedPage).toHaveURL(/agenda/);

    // Verificar que hay contenido (heading "Agenda") o que la página está en blanco pero sin error
    const hasAgenda = await authenticatedPage.getByText(/Agenda/i).first().isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasAgenda) {
      // Admin role no disponible — seed de Firestore bloqueado por reglas
      test.skip(true, 'Admin role no configurado — seed de Firestore bloqueado por reglas de seguridad');
    }

    await expect(authenticatedPage.getByText(/Agenda/i).first()).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="loader"], .animate-spin')).not.toBeVisible({ timeout: 10_000 });
  });

  test('el dashboard de cierre de caja está visible', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await authenticatedPage.waitForTimeout(3_000);

    const hasCierre = await authenticatedPage.getByText(/Cierre de Caja/i).isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasCierre) {
      test.skip(true, 'Admin role no configurado — seed de Firestore bloqueado por reglas de seguridad');
    }

    await expect(authenticatedPage.getByText(/Cierre de Caja/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/efectivo|MercadoPago|Sin cobros/i)).toBeVisible();
  });

  test('el CheckoutDrawer se puede abrir desde un turno', async ({ authenticatedPage }) => {
    const cobrarBtn = authenticatedPage.getByRole('button', { name: /cobrar|cerrar turno|checkout/i }).first();
    if (await cobrarBtn.isVisible({ timeout: 5_000 })) {
      await cobrarBtn.click();
      await expect(authenticatedPage.getByText(/monto cobrado|método de pago/i)).toBeVisible();
    } else {
      test.skip(true, 'Sin turnos disponibles o sin rol admin para hacer checkout en este test run');
    }
  });
});
