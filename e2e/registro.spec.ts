import { test, expect } from '@playwright/test';

/**
 * Tests del flujo de registro de clientas B2C (/registro) y login (/login).
 */
test.describe('Registro de Clienta B2C — /registro', () => {
  test('la página carga y muestra el formulario', async ({ page }) => {
    await page.goto('/registro');
    await expect(page.getByRole('heading', { name: /creá tu cuenta/i })).toBeVisible();
    await expect(page.getByPlaceholder(/tu@email.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/mínimo 8 caracteres/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear mi cuenta/i })).toBeVisible();
  });

  test('muestra error con email inválido', async ({ page }) => {
    await page.goto('/registro');
    await page.getByPlaceholder(/tu@email.com/i).fill('no-es-un-email');
    await page.getByPlaceholder(/mínimo 8 caracteres/i).fill('password123');
    await page.getByRole('button', { name: /crear mi cuenta/i }).click();
    // Debe mostrar algún mensaje de error o el campo no pasa validación HTML5
    const emailInput = page.getByPlaceholder(/tu@email.com/i);
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('no puede registrarse con email ya existente', async ({ page }) => {
    const existingEmail = process.env.E2E_CUSTOMER_EMAIL ?? 'e2e-clienta@mujerapp.test';
    await page.goto('/registro');
    await page.getByPlaceholder(/carolina|nombre/i).fill('Test User');
    await page.getByPlaceholder(/tu@email.com/i).fill(existingEmail);
    await page.getByPlaceholder(/mínimo 8 caracteres/i).fill('E2eTest2026!');
    await page.getByPlaceholder(/9 11 XXXX/i).fill('91145678901');
    await page.getByRole('button', { name: /crear mi cuenta/i }).click();
    // El app muestra: "Ya existe una cuenta con ese email."
    await expect(page.getByText(/ya existe una cuenta con ese email/i)).toBeVisible({ timeout: 8_000 });
  });

  test('tiene enlace de retorno al login', async ({ page }) => {
    await page.goto('/registro');
    // El footer del form ("¿Ya tenés cuenta? Iniciar sesión") es el enlace de
    // retorno; el header también tiene un botón "Iniciar sesión" (abre otro
    // flujo), por eso se acota a un <a> dentro del párrafo del footer.
    const loginLink = page.getByRole('link', { name: /iniciar sesión/i });
    await expect(loginLink).toBeVisible();
  });
});

test.describe('Login — /login', () => {
  test('la página carga con el formulario de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#l-email')).toBeVisible();
    await expect(page.locator('#l-pass')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar al atelier/i })).toBeVisible();
  });

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#l-email').fill('inexistente@test.com');
    await page.locator('#l-pass').fill('wrongpassword');
    await page.getByRole('button', { name: /entrar al atelier/i }).click();
    // El app muestra: "CREDENCIALES INCORRECTAS"
    await expect(page.getByText('CREDENCIALES INCORRECTAS')).toBeVisible({ timeout: 8_000 });
  });

  test('redirige a /perfil o /dashboard tras login exitoso', async ({ page }) => {
    const email = process.env.E2E_CUSTOMER_EMAIL ?? 'e2e-clienta@mujerapp.test';
    const password = process.env.E2E_CUSTOMER_PASSWORD ?? 'E2eTest2026!';
    await page.goto('/login');
    await page.locator('#l-email').fill(email);
    await page.locator('#l-pass').fill(password);
    await page.getByRole('button', { name: /entrar al atelier/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
    expect(page.url()).not.toContain('/login');
  });
});
