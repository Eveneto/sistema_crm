/// <reference types="cypress" />

describe('🏢 Companies CRUD - Complete Flow', () => {
  
  beforeEach(() => {
    // Setup API intercepts
    cy.interceptAPI()
    
    // Login before each test
    cy.login()
    
    // Navigate to companies page
    cy.navigateTo('companies')
  })

  describe('📋 Companies List', () => {
    it('should display companies list page correctly', () => {
      cy.get('h1, .ant-page-header-heading-title').should('contain', 'Empresas')
      cy.get('[data-testid=new-company-button]').should('be.visible')
      cy.get('.ant-table').should('be.visible')
    })

    it('should show loading state initially', () => {
      cy.visit('/companies')
      cy.get('.ant-spin-spinning').should('exist')
      cy.shouldNotBeLoading()
    })
  })

  describe('➕ Create Company', () => {
    it('should create a new company successfully', () => {
      const companyData = {
        name: 'Cypress Test Company',
        email: 'cypress@test.com',
        phone: '+5511999888777',
        website: 'https://cypress-test.com',
        industry: 'Technology'
      }

      cy.createCompany(companyData)
      
      // Verify company appears in list
      cy.contains(companyData.name).should('be.visible')
      cy.waitForAPI('@createCompany')
    })

    it('should validate required fields', () => {
      cy.get('[data-testid=new-company-button]').click()
      cy.modalShouldBeOpen()
      
      // Try to save without filling required fields
      cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
      
      // Should show validation errors
      cy.get('.ant-form-item-has-error').should('exist')
    })

    it('should validate email format', () => {
      cy.get('[data-testid=new-company-button]').click()
      
      cy.get('[data-testid=company-name-input], input[name=name]').type('Test Company')
      cy.get('[data-testid=company-email-input], input[name=email]').type('invalid-email')
      
      cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
      
      cy.get('.ant-form-item-has-error').should('contain.text', 'email')
    })
  })

  describe('✏️ Edit Company', () => {
    it('should edit company successfully', () => {
      // First create a company
      cy.createCompany({ name: 'Company to Edit' })
      
      // Then edit it
      const newData = { name: 'Edited Company Name' }
      cy.editCompany('Company to Edit', newData)
      
      // Verify changes
      cy.contains('Edited Company Name').should('be.visible')
      cy.contains('Company to Edit').should('not.exist')
      cy.waitForAPI('@updateCompany')
    })
  })

  describe('🗑️ Delete Company', () => {
    it('should delete company successfully', () => {
      // First create a company
      cy.createCompany({ name: 'Company to Delete' })
      
      // Then delete it
      cy.deleteCompany('Company to Delete')
      
      cy.waitForAPI('@deleteCompany')
    })

    it('should show confirmation dialog before delete', () => {
      cy.createCompany({ name: 'Company for Delete Confirmation' })
      
      cy.contains('Company for Delete Confirmation')
        .parents('tr')
        .find('[data-testid=delete-button], button[aria-label*="Excluir"]')
        .click()
      
      cy.get('.ant-modal').should('contain', 'Confirmar')
      
      // Cancel deletion
      cy.get('.ant-modal').contains('Cancelar').click()
      cy.modalShouldBeClosed()
      
      // Company should still exist
      cy.contains('Company for Delete Confirmation').should('be.visible')
    })
  })

  describe('🔍 Search and Filter', () => {
    beforeEach(() => {
      // Create test companies with different data
      cy.createCompany({ 
        name: 'Tech Company Alpha', 
        industry: 'Technology',
        email: 'alpha@tech.com'
      })
      cy.createCompany({ 
        name: 'Finance Company Beta', 
        industry: 'Finance',
        email: 'beta@finance.com'
      })
    })

    it('should search companies by name', () => {
      cy.get('[data-testid=search-input], .ant-input-search input').type('Tech Alpha')
      cy.get('[data-testid=search-button], .ant-input-search-button').click()
      
      cy.contains('Tech Company Alpha').should('be.visible')
      cy.contains('Finance Company Beta').should('not.exist')
    })

    it('should filter companies by industry', () => {
      cy.get('[data-testid=industry-filter], .ant-select').click()
      cy.get('.ant-select-dropdown').contains('Technology').click()
      
      cy.contains('Tech Company Alpha').should('be.visible')
      cy.contains('Finance Company Beta').should('not.exist')
    })
  })

  describe('📱 Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667) // iPhone SE
      
      cy.get('.ant-table').should('be.visible')
      cy.get('[data-testid=new-company-button]').should('be.visible')
      
      // Test mobile navigation
      cy.get('.ant-drawer-trigger, .ant-menu-trigger').click()
      cy.get('.ant-drawer-body, .ant-menu').should('be.visible')
    })

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024) // iPad
      
      cy.get('.ant-table').should('be.visible')
      cy.get('[data-testid=new-company-button]').should('be.visible')
    })
  })

  describe('⚡ Performance', () => {
    it('should load companies list quickly', () => {
      const startTime = Date.now()
      
      cy.visit('/companies')
      cy.shouldNotBeLoading()
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(5000) // Less than 5 seconds
      })
    })
  })

  describe('🔒 Authentication', () => {
    it('should redirect to login when not authenticated', () => {
      cy.logout()
      cy.visit('/companies')
      cy.url().should('include', '/login')
    })
  })

  describe('💾 Data Persistence', () => {
    it('should persist data after page refresh', () => {
      cy.createCompany({ name: 'Persistent Company' })
      
      cy.reload()
      
      cy.contains('Persistent Company').should('be.visible')
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', '**/api/companies/**', { forceNetworkError: true }).as('networkError')
      
      cy.reload()
      
      // Should show error message
      cy.get('.ant-message-error, .ant-notification-error, .ant-alert-error')
        .should('be.visible')
    })

    it('should handle server errors gracefully', () => {
      // Simulate server error
      cy.intercept('POST', '**/api/companies/**', { statusCode: 500 }).as('serverError')
      
      cy.createCompany({ name: 'Error Test Company' })
      
      // Should show error message
      cy.get('.ant-message-error, .ant-notification-error')
        .should('be.visible')
    })
  })
})
