import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import type { LoginRequest, AuthTokens, ApiResponse, User } from '../libs/shared-contracts/src/auth.types';

// Test credentials - replace with your test user credentials
const TEST_CREDENTIALS: LoginRequest = {
  email: 'test@example.com',
  password: 'testPassword123!'
};

// Helper function to perform API login
async function apiLogin(request: APIRequestContext): Promise<AuthTokens> {
  const response = await request.post('/api/auth/login', {
    data: TEST_CREDENTIALS
  });
  
  expect(response.ok()).toBeTruthy();
  
  const apiResponse: ApiResponse<AuthTokens> = await response.json();
  expect(apiResponse.success).toBeTruthy();
  expect(apiResponse.data).toBeDefined();
  expect(apiResponse.data?.accessToken).toBeTruthy();
  expect(apiResponse.data?.refreshToken).toBeTruthy();
  
  return apiResponse.data!;
}

// Helper function to inject auth tokens into browser context
async function injectAuthTokens(page: Page, tokens: AuthTokens) {
  // Store tokens in localStorage
  await page.evaluate((authTokens) => {
    localStorage.setItem('accessToken', authTokens.accessToken);
    localStorage.setItem('refreshToken', authTokens.refreshToken);
    localStorage.setItem('tokenExpiry', (Date.now() + authTokens.expiresIn * 1000).toString());
  }, tokens);
  
  // Optionally, set authorization header for API requests
  await page.setExtraHTTPHeaders({
    'Authorization': `Bearer ${tokens.accessToken}`
  });
}

// Helper function to check if user is authenticated
async function isAuthenticated(page: Page): Promise<boolean> {
  // Check if auth tokens exist in localStorage
  const hasTokens = await page.evaluate(() => {
    const accessToken = localStorage.getItem('accessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!accessToken || !tokenExpiry) {
      return false;
    }
    
    // Check if token is not expired
    return parseInt(tokenExpiry) > Date.now();
  });
  
  return hasTokens;
}

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('UI-based login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for login form to be visible
    await expect(page.locator('form[data-testid="login-form"], form#login-form, form.login-form')).toBeVisible();
    
    // Fill in credentials
    await page.fill('input[type="email"], input[name="email"], input#email', TEST_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"], input#password', TEST_CREDENTIALS.password);
    
    // Optional: Check "Remember me" if available
    const rememberMe = page.locator('input[type="checkbox"][name="remember"], input#remember-me');
    if (await rememberMe.isVisible()) {
      await rememberMe.check();
    }
    
    // Submit the form
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    // Wait for navigation to authenticated page
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
      waitUntil: 'networkidle'
    });
    
    // Validate successful login by checking for authenticated elements
    // Option 1: Check for user menu/profile element
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .user-profile, [aria-label="User menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
    
    // Option 2: Check if we're on dashboard or home page
    expect(page.url()).toMatch(/\/(dashboard|home|projects|estimates)/);
    
    // Verify authentication state
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBeTruthy();
  });

  test('API-based authentication with session injection', async ({ page, request }) => {
    // Step 1: Authenticate via API
    const tokens = await apiLogin(request);
    
    // Step 2: Navigate to the application
    await page.goto('/');
    
    // Step 3: Inject authentication tokens into browser context
    await injectAuthTokens(page, tokens);
    
    // Step 4: Reload page to apply authentication
    await page.reload();
    
    // Step 5: Verify user is authenticated
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBeTruthy();
    
    // Step 6: Navigate to a protected route
    await page.goto('/dashboard');
    
    // Should not redirect to login
    expect(page.url()).not.toContain('/login');
    
    // Should see authenticated content
    await expect(page.locator('[data-testid="dashboard-content"], .dashboard, main')).toBeVisible();
  });

  test('API authentication with cookie-based session', async ({ page, context, request }) => {
    // Step 1: Login via API
    const response = await request.post('/api/auth/login', {
      data: TEST_CREDENTIALS
    });
    
    // Step 2: Extract cookies from response
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
      // Parse and set cookies in browser context
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      for (const cookie of cookieArray) {
        const [nameValue, ...attributes] = cookie.split(';');
        const [name, value] = nameValue.trim().split('=');
        
        await context.addCookies([{
          name: name.trim(),
          value: value.trim(),
          domain: new URL(page.url()).hostname,
          path: '/',
          httpOnly: attributes.some(attr => attr.trim().toLowerCase() === 'httponly'),
          secure: attributes.some(attr => attr.trim().toLowerCase() === 'secure'),
          sameSite: 'Lax' as const
        }]);
      }
    }
    
    // Step 3: Navigate to protected area
    await page.goto('/dashboard');
    
    // Step 4: Verify access
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('[data-testid="dashboard-content"], .dashboard')).toBeVisible();
  });

  test('Validate user profile after authentication', async ({ page, request }) => {
    // Login and inject tokens
    const tokens = await apiLogin(request);
    await page.goto('/');
    await injectAuthTokens(page, tokens);
    
    // Get user profile via API
    const profileResponse = await request.get('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    });
    
    expect(profileResponse.ok()).toBeTruthy();
    const profileData: ApiResponse<User> = await profileResponse.json();
    expect(profileData.data?.email).toBe(TEST_CREDENTIALS.email);
    
    // Navigate to profile page
    await page.goto('/profile');
    
    // Verify profile information is displayed
    await expect(page.locator(`text=${profileData.data?.email}`)).toBeVisible();
    
    // Check for user name if available
    if (profileData.data?.name) {
      await expect(page.locator(`text=${profileData.data.name}`)).toBeVisible();
    }
  });

  test('Logout functionality', async ({ page, request }) => {
    // Login first
    const tokens = await apiLogin(request);
    await page.goto('/');
    await injectAuthTokens(page, tokens);
    await page.reload();
    
    // Verify authenticated
    let isAuth = await isAuthenticated(page);
    expect(isAuth).toBeTruthy();
    
    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout-button"]');
    await logoutButton.click();
    
    // Wait for redirect to login page
    await page.waitForURL('**/login', { timeout: 5000 });
    
    // Verify tokens are cleared
    isAuth = await isAuthenticated(page);
    expect(isAuth).toBeFalsy();
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Handle authentication errors', async ({ page }) => {
    await page.goto('/login');
    
    // Submit with invalid credentials
    await page.fill('input[type="email"], input[name="email"]', 'invalid@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    const errorMessage = page.locator('.error-message, .alert-error, [role="alert"], .error, .invalid-feedback');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid|incorrect|failed|error/i);
    
    // Should remain on login page
    expect(page.url()).toContain('/login');
  });

  test('Persist authentication across page reloads', async ({ page, request }) => {
    // Login and inject tokens
    const tokens = await apiLogin(request);
    await page.goto('/');
    await injectAuthTokens(page, tokens);
    
    // Navigate to protected page
    await page.goto('/dashboard');
    expect(page.url()).not.toContain('/login');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('[data-testid="dashboard-content"], .dashboard')).toBeVisible();
    
    // Verify auth state persists
    const isAuth = await isAuthenticated(page);
    expect(isAuth).toBeTruthy();
  });
});

// Test fixture for authenticated state
export const authenticatedTest = test.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page, request }, use) => {
    // Setup: Login and inject tokens
    const tokens = await apiLogin(request);
    await page.goto('/');
    await injectAuthTokens(page, tokens);
    await page.reload();
    
    // Use the authenticated page in tests
    await use(page);
    
    // Teardown: Clear auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },
});

// Example of using the authenticated fixture
authenticatedTest('Access protected features as authenticated user', async ({ authenticatedPage }) => {
  // This test starts with an already authenticated page
  await authenticatedPage.goto('/dashboard');
  
  // Should have access without redirect
  expect(authenticatedPage.url()).not.toContain('/login');
  
  // Can perform authenticated actions
  await expect(authenticatedPage.locator('[data-testid="create-estimate-button"], button:has-text("Create Estimate")')).toBeVisible();
});
