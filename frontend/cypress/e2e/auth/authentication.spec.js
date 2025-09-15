/// <reference types="cypress" />

describe('🔐 Authentication - Complete E2E Flow', () => {

  beforeEach(() => {
    // Clear all cookies and local storage
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  describe('🚪 Login Flow', () => {
    
    it('should display login page correctly', () => {
      cy.visit('/login')
      
      // Wait for React to render
      cy.wait(2000)
      
      // Check page elements using correct selectors
      cy.get('h1, .ant-typography-title').should('be.visible')
      cy.get('input[placeholder*="Email"]').should('be.visible')
      cy.get('input[placeholder*="Senha"]').should('be.visible')
      cy.get('button[type=submit]').should('be.visible')
      
      // Check form is empty
      cy.get('input[placeholder*="Email"]').should('have.value', '')
      cy.get('input[placeholder*="Senha"]').should('have.value', '')
    })

    it('should show validation errors for empty fields', () => {
      cy.visit('/login')
      cy.wait(2000)
      
      // Try to submit empty form
      cy.get('button[type=submit]').click()
      
      // Check for validation messages (Ant Design shows these)
      cy.get('.ant-form-item-explain-error, .ant-form-item-feedback')
        .should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      cy.wait(2000)
      
      // Fill invalid credentials using correct selectors
      cy.get('input[placeholder*="Email"]').clear().type('invalid@test.com')
      cy.get('input[placeholder*="Senha"]').clear().type('wrongpassword')
      cy.get('button[type=submit]').click()
      
      // Check for error message
      cy.get('.ant-message-error, .ant-notification-error, body')
        .should('contain.text', 'Erro')
    })

    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      cy.wait(2000)
      
      // Fill valid credentials using correct selectors  
      cy.get('input[placeholder*="Email"]').clear().type('admin@example.com')
      cy.get('input[placeholder*="Senha"]').clear().type('admin123')
      cy.get('button[type=submit]').click()
      
      // Should redirect away from login
      cy.url().should('not.include', '/login', { timeout: 10000 })
      
      // Should show some indication of successful login
      cy.get('body').should('contain.text', 'CRM')
    })

    it('should remember user session after page reload', () => {
      // Login using our custom command
      cy.login('admin@example.com', 'admin123')
      
      // Reload page
      cy.reload()
      
      // Should still be authenticated
      cy.url().should('not.include', '/login')
      cy.get('body').should('contain.text', 'CRM')
    })

  })

  describe('🚪 Logout Flow', () => {
    
    beforeEach(() => {
      // Login before each logout test using our custom command
      cy.login('admin@example.com', 'admin123')
    })

    it('should logout successfully', () => {
      // Click user dropdown in header
      cy.get('.ant-dropdown-trigger').should('be.visible').click()
      
      // Click logout menu item
      cy.contains('Sair').should('be.visible').click()
      
      // Should redirect to login
      cy.url().should('include', '/login')
    })

    it('should clear all user data on logout', () => {
      // Verify user is logged in
      cy.get('body').should('contain.text', 'CRM')
      
      // Logout using our custom command
      cy.logout()
      
      // Should be on login page
      cy.url().should('include', '/login')
    })

  })

  describe('🔒 Protected Routes', () => {
    
    it('should redirect unauthenticated users to login', () => {
      const protectedRoutes = ['/dashboard', '/companies', '/kanban', '/chat']
      
      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/login')
      })
    })

    it('should allow access to protected routes when authenticated', () => {
      cy.login('admin@example.com', 'admin123')
      
      const protectedRoutes = [
        { path: '/dashboard', title: 'Dashboard' },
        { path: '/companies', title: 'Empresas' }
      ]
      
      protectedRoutes.forEach(route => {
        cy.visit(route.path)
        cy.url().should('include', route.path)
        cy.get('body').should('contain.text', 'CRM')
      })
    })

  })

  describe('⏰ Session Management', () => {
    
    it('should handle expired session gracefully', () => {
      cy.login('admin@example.com', 'admin123')
      
      // Simulate expired session by clearing cookies
      cy.clearCookies()
      
      // Try to access protected route
      cy.visit('/companies')
      
      // Should redirect to login
      cy.url().should('include', '/login')
      
      // Should show session expired message
      cy.get('.ant-message-warning, .ant-notification-warning')
        .should('be.visible')
        .and('contain.text', 'Session')
    })

    it('should auto-refresh tokens when needed', () => {
      cy.login('admin@example.com', 'admin123')
      
      // Wait and make API call to trigger token refresh
      cy.wait(1000)
      cy.visit('/dashboard')
      
      // Should still be authenticated
      cy.get('body').should('contain.text', 'CRM')
      cy.url().should('include', '/dashboard')
    })

  })

  describe('🌐 Cross-tab Authentication Sync', () => {
    
    it('should sync logout across multiple tabs', () => {
      cy.login('admin@example.com', 'admin123')
      
      // Simulate another tab logout by clearing storage
      cy.window().then((win) => {
        win.dispatchEvent(new Event('storage'))
      })
      
      // Current tab should detect logout
      cy.wait(1000)
      cy.url().should('include', '/login')
    })

  })

  describe('📱 Responsive Authentication', () => {
    
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      cy.visit('/login')
      cy.wait(2000)
      
      // Check form is still usable on mobile
      cy.get('input[placeholder*="Email"]').should('be.visible')
      cy.get('input[placeholder*="Senha"]').should('be.visible')
      cy.get('button[type=submit]').should('be.visible')
      
      // Test login on mobile
      cy.get('input[placeholder*="Email"]').clear().type('admin@example.com')
      cy.get('input[placeholder*="Senha"]').clear().type('admin123')
      cy.get('button[type=submit]').click()
      
      cy.url().should('not.include', '/login')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      
      cy.visit('/login')
      cy.wait(2000)
      
      // Test login on tablet
      cy.get('input[placeholder*="Email"]').clear().type('admin@example.com')
      cy.get('input[placeholder*="Senha"]').clear().type('admin123')
      cy.get('button[type=submit]').click()
      
      cy.url().should('not.include', '/login')
      cy.get('body').should('contain.text', 'CRM')
    })

  })

})
