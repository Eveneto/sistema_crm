describe('Login Test - Debug', () => {
  it('should successfully login with admin credentials', () => {
    // Visit login page directly
    cy.visit('/login')
    
    // Debug: log what we see on the page
    cy.get('body').then(($body) => {
      cy.log('Page HTML loaded')
      cy.screenshot('login-page')
    })
    
    // Wait a bit for React to render
    cy.wait(3000)
    
    // Try to find and fill email field
    cy.get('input').first().then(($input) => {
      cy.log(`First input placeholder: ${$input.attr('placeholder')}`)
      cy.log(`First input type: ${$input.attr('type')}`)
      cy.log(`First input name: ${$input.attr('name')}`)
    })
    
    // Type credentials
    cy.get('input').first().clear().type('admin@example.com')
    cy.get('input').eq(1).clear().type('admin123')
    
    // Take screenshot before submit
    cy.screenshot('before-submit')
    
    // Click submit button
    cy.get('button[type="submit"]').click()
    
    // Wait and check result
    cy.wait(5000)
    cy.screenshot('after-submit')
    
    // Log current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`)
    })
  })
})
