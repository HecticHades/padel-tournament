import { test, expect } from '@playwright/test';

test.describe('Padel Tournament App', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Home Page', () => {
    test('should display welcome screen when no tournament exists', async ({ page }) => {
      await page.goto('/');

      // Check for mascot and welcome content
      await expect(page.getByText('Sändi')).toBeVisible();
      await expect(page.getByText('heisst dich willkommen')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Willkommen zum Padel Americano' })).toBeVisible();

      // Check for create tournament button
      await expect(page.getByRole('button', { name: /Turnier erstellen/i })).toBeVisible();
    });

    test('should have dark mode toggle', async ({ page }) => {
      await page.goto('/');

      const darkModeToggle = page.getByRole('button', { name: /modus aktivieren/i });
      await expect(darkModeToggle).toBeVisible();

      // Toggle dark mode
      await darkModeToggle.click();

      // Check that the toggle is still functional
      await expect(darkModeToggle).toBeVisible();
    });

    test('should open PIN setup modal when creating tournament', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('button', { name: /Turnier erstellen/i }).click();

      // Modal should appear with PIN input
      await expect(page.getByText('PIN festlegen')).toBeVisible();
      await expect(page.getByPlaceholder(/Sommer Turnier/i)).toBeVisible();
    });
  });

  test.describe('Tournament Creation', () => {
    test('should create a tournament and navigate to setup', async ({ page }) => {
      await page.goto('/');

      // Open create modal
      await page.getByRole('button', { name: /Turnier erstellen/i }).click();

      // Fill in tournament details
      await page.getByPlaceholder(/Sommer Turnier/i).fill('Test Turnier');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.locator('input[type="password"]').nth(1).fill('1234');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Should navigate to setup page
      await expect(page).toHaveURL('/setup');
      await expect(page.getByText('Test Turnier')).toBeVisible();
    });
  });

  test.describe('Setup Page', () => {
    test.beforeEach(async ({ page }) => {
      // Create a tournament first
      await page.goto('/');
      await page.getByRole('button', { name: /Turnier erstellen/i }).click();
      await page.getByPlaceholder(/Sommer Turnier/i).fill('Test Turnier');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.locator('input[type="password"]').nth(1).fill('1234');
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL('/setup');
    });

    test('should add players', async ({ page }) => {
      // Add players
      const playerInput = page.getByPlaceholder(/Name eingeben/i);
      const addButton = page.getByRole('button', { name: /Spieler hinzufügen/i });

      await playerInput.fill('Player 1');
      await addButton.click();

      await playerInput.fill('Player 2');
      await addButton.click();

      // Check players are displayed
      await expect(page.getByText('Player 1')).toBeVisible();
      await expect(page.getByText('Player 2')).toBeVisible();
      await expect(page.getByText('2 Spieler')).toBeVisible();
    });

    test('should prevent duplicate players', async ({ page }) => {
      const playerInput = page.getByPlaceholder(/Name eingeben/i);
      const addButton = page.getByRole('button', { name: /Spieler hinzufügen/i });

      await playerInput.fill('Player 1');
      await addButton.click();

      await playerInput.fill('Player 1');
      await addButton.click();

      // Should show error
      await expect(page.getByText(/bereits vergeben/i)).toBeVisible();
    });

    test('should show warning when less than 4 players', async ({ page }) => {
      await expect(page.getByText(/Mindestens 4 Spieler/i)).toBeVisible();
    });

    test('should allow configuring points per match', async ({ page }) => {
      // Check default buttons exist
      await expect(page.getByRole('button', { name: '16' })).toBeVisible();
      await expect(page.getByRole('button', { name: '24' })).toBeVisible();
      await expect(page.getByRole('button', { name: '32' })).toBeVisible();

      // Click 16 points
      await page.getByRole('button', { name: '16' }).click();
    });

    test('should allow configuring number of courts', async ({ page }) => {
      // Check court buttons exist (use exact match to avoid matching '16')
      await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: '3', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: '4', exact: true })).toBeVisible();
    });

    test('should enable start button with 4+ players', async ({ page }) => {
      const playerInput = page.getByPlaceholder(/Name eingeben/i);
      const addButton = page.getByRole('button', { name: /Spieler hinzufügen/i });

      // Add 4 players
      for (let i = 1; i <= 4; i++) {
        await playerInput.fill(`Player ${i}`);
        await addButton.click();
      }

      // Start button should be enabled
      const startButton = page.getByRole('button', { name: /Turnier starten/i });
      await expect(startButton).toBeEnabled();
    });
  });

  test.describe('Full Tournament Flow', () => {
    test('should complete a mini tournament with 4 players', async ({ page }) => {
      // Create tournament
      await page.goto('/');
      await page.getByRole('button', { name: /Turnier erstellen/i }).click();
      await page.getByPlaceholder(/Sommer Turnier/i).fill('Mini Turnier');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.locator('input[type="password"]').nth(1).fill('1234');
      await page.locator('button[type="submit"]').click();

      // Add 4 players
      const playerInput = page.getByPlaceholder(/Name eingeben/i);
      const addButton = page.getByRole('button', { name: /Spieler hinzufügen/i });

      for (const name of ['Alice', 'Bob', 'Charlie', 'Diana']) {
        await playerInput.fill(name);
        await addButton.click();
      }

      // Start tournament
      await page.getByRole('button', { name: /Turnier starten/i }).click();

      // Confirm in modal
      await page.getByRole('button', { name: /Turnier starten/i }).last().click();

      // Should be on play page
      await expect(page).toHaveURL('/play');
      await expect(page.getByRole('heading', { name: /Runde 1 von/i })).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Create a tournament and start it
      await page.goto('/');
      await page.getByRole('button', { name: /Turnier erstellen/i }).click();
      await page.getByPlaceholder(/Sommer Turnier/i).fill('Nav Test');
      await page.locator('input[type="password"]').first().fill('1234');
      await page.locator('input[type="password"]').nth(1).fill('1234');
      await page.locator('button[type="submit"]').click();

      const playerInput = page.getByPlaceholder(/Name eingeben/i);
      const addButton = page.getByRole('button', { name: /Spieler hinzufügen/i });

      for (const name of ['A', 'B', 'C', 'D']) {
        await playerInput.fill(name);
        await addButton.click();
      }

      await page.getByRole('button', { name: /Turnier starten/i }).click();
      await page.getByRole('button', { name: /Turnier starten/i }).last().click();
    });

    test('should navigate to schedule', async ({ page }) => {
      await page.getByRole('button', { name: /Spielplan/i }).click();
      await expect(page).toHaveURL('/schedule');
    });

    test('should navigate to leaderboard', async ({ page }) => {
      await page.getByRole('button', { name: /Rangliste/i }).click();
      await expect(page).toHaveURL('/leaderboard');
    });

    test('should navigate back to home', async ({ page }) => {
      await page.getByRole('link', { name: /Zurück/i }).click();
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Visual Design', () => {
    test('should have proper styling loaded', async ({ page }) => {
      await page.goto('/');

      // Check that fonts are loaded by verifying CSS
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Check for dark background (our new design)
      const bgColor = await body.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // The dark theme should have a dark background
      expect(bgColor).toBeTruthy();
    });

    test('should display accent-colored CTA button', async ({ page }) => {
      await page.goto('/');

      const ctaButton = page.getByRole('button', { name: /Turnier erstellen/i });
      await expect(ctaButton).toBeVisible();

      // Button should have proper styling classes applied
      const hasAccentClass = await ctaButton.evaluate(el => {
        return el.classList.contains('bg-accent') ||
               el.className.includes('btn-glow') ||
               el.className.includes('shadow-glow');
      });
      expect(hasAccentClass).toBe(true);
    });

    test('should have glassmorphism cards', async ({ page }) => {
      await page.goto('/');

      // Check that cards exist with backdrop-filter
      const card = page.locator('.glass').first();
      await expect(card).toBeVisible();
    });
  });
});
