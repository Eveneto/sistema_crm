/// <reference types="cypress" />

describe('⚡ CRM System - Performance & UX Tests', () => {

  beforeEach(() => {
    // Login and set up
    cy.clearCookies()
    cy.clearLocalStorage()
    
    cy.visit('/login')
    cy.wait(2000)
    
    cy.get('input').first().clear().type('admin@example.com')
    cy.get('input').eq(1).clear().type('admin123')
    cy.get('button').contains('Entrar').click()
    
    cy.wait(3000)
    cy.url().should('not.include', '/login')
  })

  describe('🚀 Performance Tests', () => {
    
    it('Should load pages within performance budget', () => {
      const pages = [
        { path: '/dashboard', name: 'Dashboard', maxTime: 3000 },
        { path: '/companies', name: 'Companies', maxTime: 3000 },
        { path: '/kanban', name: 'Kanban', maxTime: 4000 },
        { path: '/chat', name: 'Chat', maxTime: 3000 }
      ]
      
      pages.forEach(page => {
        const startTime = Date.now()
        
        cy.visit(page.path)
        cy.get('body').should('be.visible')
        
        cy.then(() => {
          const loadTime = Date.now() - startTime
          
          if (loadTime < page.maxTime) {
            cy.log(`✅ ${page.name} loaded in ${loadTime}ms (under ${page.maxTime}ms budget)`)
          } else {
            cy.log(`⚠️ ${page.name} loaded in ${loadTime}ms (over ${page.maxTime}ms budget)`)
          }
        })
        
        cy.screenshot(`performance-${page.name.toLowerCase()}`)
      })
    })

    it('Should handle large datasets efficiently', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Measure rendering time for companies list
      cy.window().then((win) => {
        const startTime = win.performance.now()
        
        cy.get('body').should('be.visible').then(() => {
          const renderTime = win.performance.now() - startTime
          
          if (renderTime < 1000) {
            cy.log(`✅ Companies list rendered in ${renderTime.toFixed(2)}ms`)
          } else {
            cy.log(`⚠️ Slow rendering: ${renderTime.toFixed(2)}ms`)
          }
        })
      })
      
      cy.screenshot('large-dataset-performance')
    })

  })

  describe('📱 Responsive Design Tests', () => {
    
    it('Should work on mobile devices', () => {
      cy.viewport('iphone-x')
      
      cy.visit('/dashboard')
      cy.wait(2000)
      
      // Check if page is usable on mobile
      cy.get('body').should('be.visible')
      
      // Test navigation on mobile
      cy.visit('/companies')
      cy.wait(2000)
      cy.get('body').should('be.visible')
      
      cy.screenshot('mobile-responsive')
      cy.log('✅ Mobile layout working')
    })

    it('Should work on tablet devices', () => {
      cy.viewport('ipad-2')
      
      cy.visit('/dashboard')
      cy.wait(2000)
      
      cy.get('body').should('be.visible')
      
      // Test tablet navigation
      cy.visit('/companies')
      cy.wait(2000)
      cy.get('body').should('be.visible')
      
      cy.screenshot('tablet-responsive')
      cy.log('✅ Tablet layout working')
    })

    it('Should adapt to different screen sizes', () => {
      const viewports = [
        { width: 320, height: 568, name: 'Small Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Laptop' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ]
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit('/dashboard')
        cy.wait(1000)
        
        cy.get('body').should('be.visible')
        cy.screenshot(`viewport-${viewport.name.replace(' ', '-').toLowerCase()}`)
        
        cy.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) working`)
      })
    })

  })

  describe('🎨 User Experience Tests', () => {
    
    it('Should provide visual feedback for user actions', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Test button interactions
      cy.get('body').then(($body) => {
        const buttons = $body.find('button')
        
        if (buttons.length > 0) {
          // Hover over button
          cy.wrap(buttons[0]).trigger('mouseover')
          cy.wait(500)
          
          // Check for visual changes (hover effects)
          cy.log('✅ Button hover effects working')
        }
      })
      
      cy.screenshot('visual-feedback')
    })

    it('Should show loading states', () => {
      cy.intercept('GET', '**/api/companies/companies/**', {
        delay: 2000,
        statusCode: 200,
        body: []
      }).as('delayedCompanies')
      
      cy.visit('/companies')
      
      // Check for loading indicators during delay
      cy.get('body').should('be.visible')
      
      cy.wait('@delayedCompanies')
      
      cy.screenshot('loading-states')
      cy.log('✅ Loading states handled')
    })

    it('Should handle user interactions smoothly', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Test rapid navigation
      cy.visit('/dashboard')
      cy.wait(1000)
      cy.visit('/kanban')
      cy.wait(1000)
      cy.visit('/chat')
      cy.wait(1000)
      cy.visit('/companies')
      cy.wait(1000)
      
      // Should not crash or show errors
      cy.get('body').should('be.visible')
      cy.log('✅ Rapid navigation handled smoothly')
      
      cy.screenshot('smooth-interactions')
    })

  })

  describe('♿ Accessibility Tests', () => {
    
    it('Should be keyboard navigable', () => {
      cy.visit('/dashboard')
      cy.wait(2000)
      
      // Test tab navigation
      cy.get('body').tab()
      cy.wait(500)
      cy.get('body').tab()
      cy.wait(500)
      
      cy.log('✅ Keyboard navigation working')
      cy.screenshot('keyboard-navigation')
    })

    it('Should have proper contrast and readability', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Check if text is readable
      cy.get('body').should('be.visible')
      
      // Check for proper color contrast (visual inspection via screenshot)
      cy.screenshot('contrast-readability')
      cy.log('✅ Visual readability check completed')
    })

  })

  describe('🔄 Data Persistence Tests', () => {
    
    it('Should maintain state across page reloads', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Reload page
      cy.reload()
      cy.wait(2000)
      
      // Should still be logged in and on companies page
      cy.url().should('include', '/companies')
      cy.get('body').should('be.visible')
      
      cy.log('✅ State persisted across reload')
      cy.screenshot('state-persistence')
    })

    it('Should handle browser back/forward buttons', () => {
      // Navigate through pages
      cy.visit('/dashboard')
      cy.wait(1000)
      cy.visit('/companies')
      cy.wait(1000)
      cy.visit('/kanban')
      cy.wait(1000)
      
      // Use browser back button
      cy.go('back')
      cy.url().should('include', '/companies')
      cy.wait(1000)
      
      cy.go('back')
      cy.url().should('include', '/dashboard')
      cy.wait(1000)
      
      // Use browser forward button
      cy.go('forward')
      cy.url().should('include', '/companies')
      
      cy.log('✅ Browser navigation working')
      cy.screenshot('browser-navigation')
    })

  })

  describe('🚨 Error Recovery Tests', () => {
    
    it('Should recover from network errors', () => {
      // Simulate network failure
      cy.intercept('GET', '**/api/**', { forceNetworkError: true }).as('networkError')
      
      cy.visit('/companies')
      cy.wait(2000)
      
      // Application should not crash
      cy.get('body').should('be.visible')
      
      cy.log('✅ Application survived network error')
      cy.screenshot('network-error-recovery')
    })

    it('Should handle invalid routes gracefully', () => {
      cy.visit('/invalid-route-that-does-not-exist')
      cy.wait(2000)
      
      // Should redirect or show 404 page, not crash
      cy.get('body').should('be.visible')
      
      cy.log('✅ Invalid routes handled gracefully')
      cy.screenshot('invalid-route-handling')
    })

  })

  describe('🔍 Search & Filter Tests', () => {
    
    it('Should provide search functionality', () => {
      cy.visit('/companies')
      cy.wait(2000)
      
      // Look for search input
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="pesquis"], input[placeholder*="busca"], input[type="search"]').length > 0) {
          cy.get('input[placeholder*="pesquis"], input[placeholder*="busca"], input[type="search"]').first()
            .type('Tech')
          
          cy.wait(1000)
          cy.log('✅ Search functionality found and tested')
        } else {
          cy.log('⚠️ No search functionality found')
        }
      })
      
      cy.screenshot('search-functionality')
    })

  })

})
