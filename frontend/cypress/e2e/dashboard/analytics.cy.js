/// <reference types="cypress" />

describe('📊 Dashboard Analytics', () => {
  
  beforeEach(() => {
    cy.interceptAPI()
    cy.login()
    cy.navigateTo('dashboard')
  })

  describe('📈 Dashboard Layout', () => {
    it('should display dashboard correctly', () => {
      cy.get('h1, .ant-page-header-heading-title').should('contain', 'Dashboard')
      cy.get('.ant-card').should('have.length.greaterThan', 0)
      cy.shouldNotBeLoading()
    })

    it('should display key metrics cards', () => {
      const expectedMetrics = [
        'Total Empresas',
        'Clientes Ativos', 
        'Prospects',
        'Receita Total'
      ]
      
      expectedMetrics.forEach(metric => {
        cy.contains(metric).should('be.visible')
      })
    })

    it('should display charts and graphs', () => {
      cy.get('canvas, svg, .chart-container').should('exist')
      cy.get('.ant-card').contains('Gráfico').should('exist')
    })
  })

  describe('📊 Data Visualization', () => {
    it('should show companies growth chart', () => {
      cy.get('[data-testid=companies-chart], .companies-chart').should('be.visible')
      cy.get('canvas').should('be.visible')
    })

    it('should show revenue analytics', () => {
      cy.get('[data-testid=revenue-chart], .revenue-chart').should('be.visible')
    })

    it('should display recent activities', () => {
      cy.get('[data-testid=recent-activities], .recent-activities').should('be.visible')
      cy.get('.ant-list-item').should('have.length.greaterThan', 0)
    })
  })

  describe('🔄 Real-time Updates', () => {
    it('should update metrics when data changes', () => {
      // Get initial count
      cy.get('[data-testid=total-companies]').invoke('text').then((initialCount) => {
        // Create a new company
        cy.navigateTo('companies')
        cy.createCompany({ name: 'Dashboard Test Company' })
        
        // Return to dashboard
        cy.navigateTo('dashboard')
        
        // Check if count increased
        cy.get('[data-testid=total-companies]').should('not.contain', initialCount)
      })
    })
  })

  describe('🎯 Interactive Elements', () => {
    it('should navigate to companies when clicking on companies metric', () => {
      cy.get('[data-testid=companies-metric], .companies-metric').click()
      cy.url().should('include', '/companies')
    })

    it('should filter dashboard data by date range', () => {
      cy.get('[data-testid=date-range-picker], .ant-picker').click()
      cy.get('.ant-picker-dropdown').should('be.visible')
      
      // Select last 30 days
      cy.get('.ant-picker-dropdown').contains('Últimos 30 dias').click()
      
      // Dashboard should update
      cy.shouldNotBeLoading()
    })
  })

  describe('📱 Responsive Dashboard', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667)
      
      cy.get('.ant-card').should('be.visible')
      cy.get('canvas, svg').should('be.visible')
      
      // Cards should stack vertically on mobile
      cy.get('.ant-row .ant-col').should('have.css', 'flex-direction')
    })

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024)
      
      cy.get('.ant-card').should('be.visible')
      cy.get('canvas, svg').should('be.visible')
    })
  })

  describe('⚡ Performance', () => {
    it('should load dashboard quickly', () => {
      const startTime = Date.now()
      
      cy.visit('/dashboard')
      cy.shouldNotBeLoading()
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // Less than 3 seconds
      })
    })

    it('should lazy load non-critical components', () => {
      cy.get('.ant-card').should('be.visible')
      
      // Charts might load after initial render
      cy.get('canvas, svg', { timeout: 10000 }).should('be.visible')
    })
  })

  describe('📈 Analytics Functionality', () => {
    it('should export dashboard data', () => {
      cy.get('[data-testid=export-button], button').contains('Exportar').click()
      
      cy.get('.ant-dropdown-menu').should('be.visible')
      cy.get('.ant-dropdown-menu').contains('PDF').click()
      
      // Should trigger download
      cy.get('.ant-message-success').should('be.visible')
    })

    it('should refresh dashboard data', () => {
      cy.get('[data-testid=refresh-button], button[aria-label="refresh"]').click()
      
      cy.get('.ant-spin-spinning').should('exist')
      cy.shouldNotBeLoading()
    })
  })

  describe('🎨 Customization', () => {
    it('should allow dashboard customization', () => {
      cy.get('[data-testid=customize-button], button').contains('Personalizar').click()
      
      cy.get('.ant-modal').should('be.visible')
      cy.get('.ant-modal').contains('Configurações do Dashboard').should('be.visible')
    })

    it('should save dashboard preferences', () => {
      cy.get('[data-testid=settings-button], .settings-button').click()
      
      // Change theme or layout
      cy.get('.ant-modal input[type=checkbox]').first().click()
      cy.get('.ant-modal').contains('Salvar').click()
      
      // Settings should persist
      cy.reload()
      cy.get('[data-testid=settings-button], .settings-button').click()
      cy.get('.ant-modal input[type=checkbox]').first().should('be.checked')
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '**/api/dashboard/**', { statusCode: 500 }).as('dashboardError')
      
      cy.reload()
      
      cy.get('.ant-alert-error, .ant-message-error').should('be.visible')
    })

    it('should show fallback content when charts fail to load', () => {
      cy.intercept('GET', '**/api/dashboard/charts/**', { statusCode: 404 }).as('chartsError')
      
      cy.reload()
      
      cy.get('.ant-empty, .error-placeholder').should('be.visible')
    })
  })
})
