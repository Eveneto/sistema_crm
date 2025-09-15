/// <reference types="cypress" />

describe('🔐 Authentication Flow', () => {
  
  beforeEach(() => {
    cy.interceptAPI()
  })

  describe('📝 Login Process', () => {
    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid=email-input], input[type=email]').type('admin@test.com')
      cy.get('[data-testid=password-input], input[type=password]').type('admin123')
      cy.get('[data-testid=login-button], button[type=submit]').click()
      
      // Should redirect to dashboard
      cy.url().should('not.include', '/login')
      cy.url().should('include', '/dashboard')
      
      // Should show user menu
      cy.get('[data-testid=user-menu], .ant-dropdown-trigger').should('be.visible')
    })

    it('should show error with invalid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid=email-input], input[type=email]').type('invalid@test.com')
      cy.get('[data-testid=password-input], input[type=password]').type('wrongpassword')
      cy.get('[data-testid=login-button], button[type=submit]').click()
      
      // Should stay on login page
      cy.url().should('include', '/login')
      
      // Should show error message
      cy.get('.ant-message-error, .ant-notification-error, .ant-alert-error')
        .should('be.visible')
    })

    it('should validate required fields', () => {
      cy.visit('/login')
      
      // Try to submit without filling fields
      cy.get('[data-testid=login-button], button[type=submit]').click()
      
      // Should show validation errors
      cy.get('.ant-form-item-has-error').should('exist')
    })

    it('should validate email format', () => {
      cy.visit('/login')
      
      cy.get('[data-testid=email-input], input[type=email]').type('invalid-email')
      cy.get('[data-testid=password-input], input[type=password]').type('password123')
      cy.get('[data-testid=login-button], button[type=submit]').click()
      
      cy.get('.ant-form-item-has-error').should('exist')
    })
  })

  describe('🔓 Logout Process', () => {
    beforeEach(() => {
      cy.login()
    })

    it('should logout successfully', () => {
      cy.logout()
      cy.url().should('include', '/login')
    })

    it('should logout from user menu', () => {
      cy.get('[data-testid=user-menu], .ant-dropdown-trigger').click()
      cy.get('[data-testid=logout-button]').should('be.visible').click()
      
      cy.url().should('include', '/login')
    })
  })

  describe('🛡️ Route Protection', () => {
    it('should redirect to login when accessing protected routes without auth', () => {
      const protectedRoutes = ['/dashboard', '/companies', '/chat', '/kanban']
      
      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/login')
      })
    })

    it('should redirect to dashboard when accessing login while authenticated', () => {
      cy.login()
      cy.visit('/login')
      cy.url().should('include', '/dashboard')
    })
  })

  describe('🔄 Session Management', () => {
    it('should maintain session after page refresh', () => {
      cy.login()
      cy.visit('/dashboard')
      
      cy.reload()
      
      // Should still be logged in
      cy.url().should('not.include', '/login')
      cy.get('[data-testid=user-menu], .ant-dropdown-trigger').should('be.visible')
    })

    it('should handle session expiration', () => {
      cy.login()
      
      // Simulate expired token
      cy.window().then((win) => {
        win.localStorage.removeItem('authToken')
        win.sessionStorage.clear()
      })
      
      cy.visit('/companies')
      cy.url().should('include', '/login')
    })
  })

  describe('📱 Responsive Authentication', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667)
      
      cy.visit('/login')
      
      cy.get('[data-testid=email-input], input[type=email]').should('be.visible')
      cy.get('[data-testid=password-input], input[type=password]').should('be.visible')
      cy.get('[data-testid=login-button], button[type=submit]').should('be.visible')
      
      cy.login()
      
      cy.get('[data-testid=user-menu], .ant-dropdown-trigger').should('be.visible')
    })
  })

  describe('🔐 Security Features', () => {
    it('should not expose sensitive data in localStorage', () => {
      cy.login()
      
      cy.window().then((win) => {
        const localStorage = win.localStorage
        const sessionStorage = win.sessionStorage
        
        // Check that passwords are not stored
        Object.keys(localStorage).forEach(key => {
          expect(localStorage.getItem(key)).to.not.include('password')
          expect(localStorage.getItem(key)).to.not.include('admin123')
        })
        
        Object.keys(sessionStorage).forEach(key => {
          expect(sessionStorage.getItem(key)).to.not.include('password')
          expect(sessionStorage.getItem(key)).to.not.include('admin123')
        })
      })
    })

    it('should clear sensitive data on logout', () => {
      cy.login()
      cy.logout()
      
      cy.window().then((win) => {
        const localStorage = win.localStorage
        const sessionStorage = win.sessionStorage
        
        // Auth tokens should be cleared
        expect(localStorage.getItem('authToken')).to.be.null
        expect(sessionStorage.getItem('authToken')).to.be.null
      })
    })
  })

  describe('🌐 Multi-tab Authentication', () => {
    it('should sync logout across tabs', () => {
      cy.login()
      
      // Simulate logout in another tab
      cy.window().then((win) => {
        win.localStorage.removeItem('authToken')
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'authToken',
          oldValue: 'some-token',
          newValue: null
        }))
      })
      
      // Should redirect to login
      cy.url().should('include', '/login')
    })
  })
})
