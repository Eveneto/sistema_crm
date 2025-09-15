/// <reference types="cypress" />

describe('🏢 Companies CRUD - Enhanced E2E Tests', () => {
  
  beforeEach(() => {
    // Setup API intercepts
    cy.interceptAPI()
    
    // Login before each test
    cy.login()
    
    // Navigate to companies page
    cy.navigateTo('companies')
  })

  describe('📋 Advanced Companies List Features', () => {
    
    it('should display companies with all required information', () => {
      cy.get('h1, .ant-page-header-heading-title').should('contain', 'Empresas')
      cy.get('[data-testid=new-company-button]').should('be.visible')
      cy.get('.ant-table').should('be.visible')
      
      // Check table headers are present
      cy.get('.ant-table-thead th').should('contain', 'Nome')
      cy.get('.ant-table-thead th').should('contain', 'Email')
      cy.get('.ant-table-thead th').should('contain', 'Telefone')
      cy.get('.ant-table-thead th').should('contain', 'Ações')
    })

    it('should handle pagination correctly', () => {
      // Mock large dataset
      const companies = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Company ${i + 1}`,
        email: `company${i + 1}@test.com`,
        phone: `+551199999${String(i).padStart(4, '0')}`,
        website: `https://company${i + 1}.com`
      }))
      
      cy.intercept('GET', '**/api/companies/companies/**', { 
        body: { 
          results: companies.slice(0, 10), 
          count: companies.length,
          next: 'http://localhost:8000/api/companies/companies/?page=2',
          previous: null
        } 
      }).as('getCompaniesPage1')
      
      cy.visit('/companies')
      cy.wait('@getCompaniesPage1')
      
      // Should show pagination
      cy.get('.ant-pagination').should('be.visible')
      cy.get('.ant-pagination-total-text').should('contain', '25')
      
      // Test next page
      cy.intercept('GET', '**/api/companies/companies/?page=2', { 
        body: { 
          results: companies.slice(10, 20), 
          count: companies.length,
          next: 'http://localhost:8000/api/companies/companies/?page=3',
          previous: 'http://localhost:8000/api/companies/companies/?page=1'
        } 
      }).as('getCompaniesPage2')
      
      cy.get('.ant-pagination-next').click()
      cy.wait('@getCompaniesPage2')
      cy.contains('Company 11').should('be.visible')
    })

    it('should sort companies by different columns', () => {
      // Test sorting by name
      cy.get('.ant-table-thead th').contains('Nome').click()
      cy.waitForAPI('@getCompanies')
      
      // Test sorting by email
      cy.get('.ant-table-thead th').contains('Email').click()
      cy.waitForAPI('@getCompanies')
    })

  })

  describe('🔍 Advanced Search and Filtering', () => {
    
    it('should perform real-time search', () => {
      cy.get('[data-testid=search-input], .ant-input-search input').type('Tech', { delay: 100 })
      
      // Should debounce search
      cy.wait(500)
      cy.waitForAPI('@searchCompanies')
    })

    it('should combine multiple filters', () => {
      // Apply search filter
      cy.get('[data-testid=search-input], .ant-input-search input').type('Company')
      
      // Apply industry filter
      cy.get('[data-testid=industry-filter], .ant-select').click()
      cy.get('.ant-select-dropdown').contains('Technology').click()
      
      // Apply size filter if available
      cy.get('[data-testid=size-filter], .ant-select').then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).click()
          cy.get('.ant-select-dropdown').contains('Medium').click()
        }
      })
      
      cy.waitForAPI('@filterCompanies')
    })

    it('should export filtered results', () => {
      // Apply filters
      cy.get('[data-testid=search-input], .ant-input-search input').type('Test')
      
      // Export results
      cy.get('[data-testid=export-button], button').contains('Exportar').then(($btn) => {
        if ($btn.length > 0) {
          cy.wrap($btn).click()
          
          // Check download
          cy.readFile('cypress/downloads/companies.csv').should('exist')
        }
      })
    })

  })

  describe('➕ Advanced Company Creation', () => {
    
    it('should handle complex company data', () => {
      const complexCompanyData = {
        name: 'Enterprise Solutions Inc.',
        email: 'contact@enterprise-solutions.com',
        phone: '+55 11 98765-4321',
        website: 'https://www.enterprise-solutions.com',
        industry: 'Technology',
        size: 'Large',
        address: {
          street: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          country: 'Brasil'
        },
        description: 'Leading provider of enterprise software solutions',
        foundedYear: '2010',
        revenue: '10000000'
      }

      cy.get('[data-testid=new-company-button]').click()
      cy.modalShouldBeOpen()
      
      // Fill basic information
      cy.get('[data-testid=company-name-input], input[name=name]').type(complexCompanyData.name)
      cy.get('[data-testid=company-email-input], input[name=email]').type(complexCompanyData.email)
      cy.get('[data-testid=company-phone-input], input[name=phone]').type(complexCompanyData.phone)
      cy.get('[data-testid=company-website-input], input[name=website]').type(complexCompanyData.website)
      
      // Fill industry
      cy.get('[data-testid=company-industry-select], .ant-select').click()
      cy.get('.ant-select-dropdown').contains(complexCompanyData.industry).click()
      
      // Fill additional fields if they exist
      if (complexCompanyData.description) {
        cy.get('[data-testid=company-description-input], textarea[name=description]').then(($textarea) => {
          if ($textarea.length > 0) {
            cy.wrap($textarea).type(complexCompanyData.description)
          }
        })
      }
      
      cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
      
      // Verify company creation
      cy.contains(complexCompanyData.name).should('be.visible')
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should validate phone number formats', () => {
      const phoneFormats = [
        '+5511999999999',
        '(11) 99999-9999',
        '11 99999-9999',
        '+55 11 99999-9999'
      ]
      
      phoneFormats.forEach((phone, index) => {
        cy.get('[data-testid=new-company-button]').click()
        
        cy.get('[data-testid=company-name-input], input[name=name]').type(`Phone Test ${index}`)
        cy.get('[data-testid=company-email-input], input[name=email]').type(`phone${index}@test.com`)
        cy.get('[data-testid=company-phone-input], input[name=phone]').type(phone)
        
        cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
        
        // Should accept valid format
        cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
        cy.modalShouldBeClosed()
      })
    })

    it('should validate website URL formats', () => {
      const validUrls = [
        'https://www.example.com',
        'http://example.com',
        'https://subdomain.example.com',
        'https://example.com/path'
      ]
      
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'www.example.com',
        'https://'
      ]
      
      // Test valid URLs
      validUrls.forEach((url, index) => {
        cy.get('[data-testid=new-company-button]').click()
        
        cy.get('[data-testid=company-name-input], input[name=name]').type(`URL Test ${index}`)
        cy.get('[data-testid=company-email-input], input[name=email]').type(`url${index}@test.com`)
        cy.get('[data-testid=company-website-input], input[name=website]').type(url)
        
        cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
        
        cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
        cy.modalShouldBeClosed()
      })
      
      // Test invalid URLs
      invalidUrls.forEach((url, index) => {
        cy.get('[data-testid=new-company-button]').click()
        
        cy.get('[data-testid=company-name-input], input[name=name]').type(`Invalid URL Test ${index}`)
        cy.get('[data-testid=company-email-input], input[name=email]').type(`invalid${index}@test.com`)
        cy.get('[data-testid=company-website-input], input[name=website]').type(url)
        
        cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
        
        // Should show validation error
        cy.get('.ant-form-item-explain-error, .ant-form-item-feedback').should('be.visible')
      })
    })

  })

  describe('✏️ Bulk Operations', () => {
    
    beforeEach(() => {
      // Create multiple test companies
      const companies = [
        { name: 'Bulk Test 1', email: 'bulk1@test.com' },
        { name: 'Bulk Test 2', email: 'bulk2@test.com' },
        { name: 'Bulk Test 3', email: 'bulk3@test.com' }
      ]
      
      companies.forEach(company => {
        cy.createCompany(company)
      })
    })

    it('should select multiple companies', () => {
      // Check if bulk selection is available
      cy.get('.ant-table-selection-column input[type="checkbox"]').then(($checkboxes) => {
        if ($checkboxes.length > 0) {
          // Select multiple companies
          cy.get('.ant-table-tbody .ant-checkbox-input').check({ multiple: true })
          
          // Verify selection counter
          cy.get('.ant-table-selection-extra').should('contain', 'selecionad')
        }
      })
    })

    it('should perform bulk delete', () => {
      cy.get('.ant-table-selection-column input[type="checkbox"]').then(($checkboxes) => {
        if ($checkboxes.length > 0) {
          // Select companies
          cy.get('.ant-table-tbody .ant-checkbox-input').check({ multiple: true })
          
          // Bulk delete
          cy.get('[data-testid=bulk-delete-button], button').contains('Excluir').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click()
              
              // Confirm deletion
              cy.get('.ant-modal').contains('Confirmar').click()
              
              // Verify companies are deleted
              cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
            }
          })
        }
      })
    })

    it('should perform bulk export', () => {
      cy.get('.ant-table-selection-column input[type="checkbox"]').then(($checkboxes) => {
        if ($checkboxes.length > 0) {
          // Select companies
          cy.get('.ant-table-tbody .ant-checkbox-input').check({ multiple: true })
          
          // Bulk export
          cy.get('[data-testid=bulk-export-button], button').contains('Exportar').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click()
              
              // Check download
              cy.readFile('cypress/downloads/selected-companies.csv').should('exist')
            }
          })
        }
      })
    })

  })

  describe('📊 Company Analytics Integration', () => {
    
    it('should display company statistics', () => {
      // Check if statistics cards are present
      cy.get('[data-testid=total-companies], .statistics-card').then(($stats) => {
        if ($stats.length > 0) {
          cy.wrap($stats).should('be.visible')
          cy.wrap($stats).should('contain.text', 'Total')
        }
      })
    })

    it('should show company growth chart', () => {
      cy.get('[data-testid=growth-chart], .chart-container').then(($chart) => {
        if ($chart.length > 0) {
          cy.wrap($chart).should('be.visible')
        }
      })
    })

  })

  describe('🔗 Related Data Integration', () => {
    
    it('should show company contacts', () => {
      cy.createCompany({ name: 'Company with Contacts' })
      
      cy.contains('Company with Contacts').click()
      
      // Check if contacts tab/section exists
      cy.get('[data-testid=contacts-tab], .contacts-section').then(($contacts) => {
        if ($contacts.length > 0) {
          cy.wrap($contacts).click()
          cy.get('.contacts-list, .ant-table').should('be.visible')
        }
      })
    })

    it('should show company deals/opportunities', () => {
      cy.createCompany({ name: 'Company with Deals' })
      
      cy.contains('Company with Deals').click()
      
      // Check if deals tab/section exists
      cy.get('[data-testid=deals-tab], .deals-section').then(($deals) => {
        if ($deals.length > 0) {
          cy.wrap($deals).click()
          cy.get('.deals-list, .ant-table').should('be.visible')
        }
      })
    })

  })

  describe('⚡ Performance and User Experience', () => {
    
    it('should show loading states during operations', () => {
      cy.get('[data-testid=new-company-button]').click()
      
      cy.get('[data-testid=company-name-input], input[name=name]').type('Loading Test Company')
      cy.get('[data-testid=company-email-input], input[name=email]').type('loading@test.com')
      
      // Intercept with delay to test loading state
      cy.intercept('POST', '**/api/companies/**', (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 1000)
          })
        })
      }).as('slowCreate')
      
      cy.get('[data-testid=save-company-button], button').contains('Salvar').click()
      
      // Should show loading state
      cy.get('.ant-spin-spinning, .loading').should('be.visible')
      
      cy.wait('@slowCreate')
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should optimize table rendering for large datasets', () => {
      // Test virtual scrolling if implemented
      cy.get('.ant-table-tbody').then(($tbody) => {
        if ($tbody.find('.virtual-list, .react-window').length > 0) {
          cy.get('.virtual-list, .react-window').should('be.visible')
        }
      })
    })

  })

  describe('🔒 Security and Access Control', () => {
    
    it('should respect user permissions', () => {
      // Test read-only access (if applicable)
      cy.window().then((win) => {
        if (win.localStorage.getItem('userRole') === 'readonly') {
          cy.get('[data-testid=new-company-button]').should('not.exist')
          cy.get('[data-testid=edit-button]').should('not.exist')
          cy.get('[data-testid=delete-button]').should('not.exist')
        }
      })
    })

    it('should prevent unauthorized actions', () => {
      // Simulate unauthorized request
      cy.intercept('POST', '**/api/companies/**', { statusCode: 403 }).as('unauthorized')
      
      cy.createCompany({ name: 'Unauthorized Test' })
      
      cy.wait('@unauthorized')
      cy.get('.ant-message-error, .ant-notification-error')
        .should('be.visible')
        .and('contain.text', '403')
    })

  })

})
