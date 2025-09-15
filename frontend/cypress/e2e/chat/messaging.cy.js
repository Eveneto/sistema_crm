/// <reference types="cypress" />

describe('💬 Chat System', () => {
  
  beforeEach(() => {
    cy.interceptAPI()
    cy.login()
    cy.navigateTo('chat')
  })

  describe('💬 Chat Interface', () => {
    it('should display chat interface correctly', () => {
      cy.get('.chat-container, .ant-layout').should('be.visible')
      cy.get('.chat-sidebar, .conversations-list').should('be.visible')
      cy.get('.chat-main, .messages-container').should('be.visible')
      cy.get('.message-input, .ant-input').should('be.visible')
    })

    it('should show conversations list', () => {
      cy.get('.conversation-item, .chat-item').should('have.length.greaterThan', 0)
      cy.get('.conversation-item').first().should('contain.text', 'João')
    })

    it('should display messages in selected conversation', () => {
      cy.get('.conversation-item').first().click()
      cy.get('.message-item, .chat-message').should('have.length.greaterThan', 0)
    })
  })

  describe('📝 Sending Messages', () => {
    it('should send a text message', () => {
      const testMessage = 'Test message from Cypress ' + Date.now()
      
      cy.get('.conversation-item').first().click()
      
      cy.get('.message-input, input[placeholder*="mensagem"]').type(testMessage)
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // Message should appear in chat
      cy.contains(testMessage).should('be.visible')
      
      // Input should be cleared
      cy.get('.message-input, input').should('have.value', '')
    })

    it('should send message with Enter key', () => {
      const testMessage = 'Enter key test message'
      
      cy.get('.conversation-item').first().click()
      
      cy.get('.message-input, input[placeholder*="mensagem"]').type(testMessage)
      cy.get('.message-input, input').type('{enter}')
      
      cy.contains(testMessage).should('be.visible')
    })

    it('should not send empty messages', () => {
      cy.get('.conversation-item').first().click()
      
      // Try to send empty message
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // Should not add empty message
      cy.get('.message-item').should('not.contain', '')
    })
  })

  describe('📎 File Attachments', () => {
    it('should upload and send file attachment', () => {
      cy.get('.conversation-item').first().click()
      
      cy.get('.attachment-button, button[aria-label*="anexo"]').click()
      
      // Create a test file
      const fileName = 'test-document.txt'
      const fileContent = 'This is a test document for Cypress'
      
      cy.get('input[type=file]').selectFile({
        contents: Cypress.Buffer.from(fileContent),
        fileName: fileName,
        mimeType: 'text/plain'
      }, { force: true })
      
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // File should appear in chat
      cy.contains(fileName).should('be.visible')
    })

    it('should validate file size limits', () => {
      cy.get('.conversation-item').first().click()
      
      // Try to upload large file (simulate)
      cy.get('.attachment-button, button[aria-label*="anexo"]').click()
      
      // Should show error for large files
      const largeFile = new Array(10 * 1024 * 1024).join('x') // 10MB string
      
      cy.get('input[type=file]').selectFile({
        contents: Cypress.Buffer.from(largeFile),
        fileName: 'large-file.txt',
        mimeType: 'text/plain'
      }, { force: true })
      
      cy.get('.ant-message-error, .file-size-error').should('be.visible')
    })
  })

  describe('🔍 Search Functionality', () => {
    it('should search messages in conversation', () => {
      cy.get('.conversation-item').first().click()
      
      cy.get('.search-button, .ant-input-search').click()
      cy.get('.search-input, input[placeholder*="buscar"]').type('test')
      
      // Should highlight search results
      cy.get('.message-highlight, .search-result').should('exist')
    })

    it('should search conversations', () => {
      cy.get('.conversation-search, input[placeholder*="conversa"]').type('João')
      
      cy.get('.conversation-item').should('have.length', 1)
      cy.get('.conversation-item').should('contain', 'João')
    })
  })

  describe('🔄 Real-time Features', () => {
    it('should show typing indicator', () => {
      cy.get('.conversation-item').first().click()
      
      cy.get('.message-input, input').type('Testing typing...')
      
      // Should show typing indicator
      cy.get('.typing-indicator, .is-typing').should('be.visible')
      
      cy.wait(2000)
      
      // Should hide after inactivity
      cy.get('.typing-indicator, .is-typing').should('not.exist')
    })

    it('should show online status', () => {
      cy.get('.conversation-item').each(($item) => {
        cy.wrap($item).find('.status-indicator, .online-status').should('exist')
      })
    })

    it('should show message delivery status', () => {
      const testMessage = 'Delivery status test'
      
      cy.get('.conversation-item').first().click()
      cy.get('.message-input, input').type(testMessage)
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // Should show delivery status (sent, delivered, read)
      cy.contains(testMessage).parent().find('.message-status, .delivery-status').should('exist')
    })
  })

  describe('🎨 Chat Customization', () => {
    it('should change chat theme', () => {
      cy.get('.chat-settings, .settings-button').click()
      cy.get('.theme-option, .ant-radio').contains('Escuro').click()
      
      // Chat should update to dark theme
      cy.get('.chat-container').should('have.class', 'dark-theme')
    })

    it('should adjust font size', () => {
      cy.get('.chat-settings, .settings-button').click()
      cy.get('.font-size-slider, .ant-slider').click(75, 0) // Click on 75% position
      
      // Messages should have larger font
      cy.get('.message-text').should('have.css', 'font-size').and('not.equal', '14px')
    })
  })

  describe('📱 Responsive Chat', () => {
    it('should work correctly on mobile devices', () => {
      cy.viewport(375, 667)
      
      // On mobile, sidebar might be hidden initially
      cy.get('.chat-main, .messages-container').should('be.visible')
      
      // Should be able to toggle sidebar
      cy.get('.sidebar-toggle, .menu-button').click()
      cy.get('.chat-sidebar, .conversations-list').should('be.visible')
    })

    it('should work correctly on tablet devices', () => {
      cy.viewport(768, 1024)
      
      cy.get('.chat-sidebar, .conversations-list').should('be.visible')
      cy.get('.chat-main, .messages-container').should('be.visible')
    })
  })

  describe('💾 Message History', () => {
    it('should load message history when scrolling up', () => {
      cy.get('.conversation-item').first().click()
      
      // Scroll to top to load older messages
      cy.get('.messages-container').scrollTo('top')
      
      // Should show loading indicator
      cy.get('.loading-indicator, .ant-spin').should('be.visible')
      
      // Should load more messages
      cy.get('.message-item').should('have.length.greaterThan', 10)
    })

    it('should persist chat data after refresh', () => {
      const testMessage = 'Persistence test message'
      
      cy.get('.conversation-item').first().click()
      cy.get('.message-input, input').type(testMessage)
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      cy.reload()
      
      cy.get('.conversation-item').first().click()
      cy.contains(testMessage).should('be.visible')
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle connection errors gracefully', () => {
      // Simulate network error
      cy.intercept('POST', '**/api/chat/messages/**', { forceNetworkError: true }).as('messageError')
      
      cy.get('.conversation-item').first().click()
      cy.get('.message-input, input').type('Error test message')
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // Should show error indicator
      cy.get('.message-error, .error-indicator').should('be.visible')
      cy.get('.retry-button, button[aria-label*="tentar"]').should('be.visible')
    })

    it('should retry failed messages', () => {
      // First simulate error, then success
      cy.intercept('POST', '**/api/chat/messages/**', { statusCode: 500 }).as('messageError')
      
      cy.get('.conversation-item').first().click()
      cy.get('.message-input, input').type('Retry test message')
      cy.get('.send-button, button[aria-label*="enviar"]').click()
      
      // Should show error
      cy.get('.message-error, .error-indicator').should('be.visible')
      
      // Fix the intercept and retry
      cy.intercept('POST', '**/api/chat/messages/**', { statusCode: 200 }).as('messageSuccess')
      cy.get('.retry-button, button[aria-label*="tentar"]').click()
      
      // Should succeed
      cy.contains('Retry test message').should('be.visible')
      cy.get('.message-error, .error-indicator').should('not.exist')
    })
  })
})
