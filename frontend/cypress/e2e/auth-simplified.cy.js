/// <reference types="cypress" />

describe('🔐 Authentication - Simplified Test', () => {

  beforeEach(() => {
    // Clear all storage
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  it('✅ Should login successfully with admin credentials', () => {
    // Use our custom login command
    cy.login('admin@example.com', 'admin123')
    
    // Verify we're not on login page anymore
    cy.url().should('not.include', '/login')
    
    // Verify we can see the CRM interface
    cy.get('body').should('contain.text', 'CRM')
    
    // Take a screenshot for verification
    cy.screenshot('successful-login')
  })

  it('✅ Should logout successfully', () => {
    // Login first
    cy.login('admin@example.com', 'admin123')
    
    // Use our custom logout command
    cy.logout()
    
    // Verify we're back on login page
    cy.url().should('include', '/login')
    
    // Take a screenshot for verification
    cy.screenshot('successful-logout')
  })

  it('✅ Should persist session after page reload', () => {
    // Login
    cy.login('admin@example.com', 'admin123')
    
    // Reload the page
    cy.reload()
    
    // Should still be logged in
    cy.url().should('not.include', '/login')
    cy.get('body').should('contain.text', 'CRM')
    
    // Take a screenshot for verification
    cy.screenshot('session-persisted')
  })

  it('✅ Should access protected pages when authenticated', () => {
    // Login
    cy.login('admin@example.com', 'admin123')
    
    // Try to access companies page
    cy.visit('/companies')
    cy.url().should('include', '/companies')
    cy.get('body').should('contain.text', 'Empresas')
    
    // Try to access dashboard
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
    
    // Take a screenshot for verification
    cy.screenshot('protected-pages-access')
  })

})
