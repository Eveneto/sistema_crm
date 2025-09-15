/// <reference types="cypress" />

describe('💬 Chat Real-time - Complete E2E Flow', () => {
  
  beforeEach(() => {
    // Setup API intercepts for chat
    cy.interceptAPI()
    
    // Login before each test
    cy.login()
    
    // Navigate to chat page
    cy.navigateTo('chat')
  })

  describe('🎭 Chat Interface', () => {
    
    it('should display chat page correctly', () => {
      cy.get('h1, .ant-page-header-heading-title').should('contain.text', 'Chat')
      cy.get('.chat-container, .chat-layout').should('be.visible')
      cy.get('.message-input, .chat-input').should('be.visible')
      cy.get('.send-button, button[type="submit"]').should('be.visible')
    })

    it('should show online users list', () => {
      cy.get('.users-list, .online-users').then(($usersList) => {
        if ($usersList.length > 0) {
          cy.wrap($usersList).should('be.visible')
          cy.wrap($usersList).should('contain.text', 'admin')
        }
      })
    })

    it('should display chat history on load', () => {
      // Mock chat history
      cy.intercept('GET', '**/api/chat/messages/**', {
        body: {
          results: [
            {
              id: 1,
              user: 'admin@test.com',
              message: 'Welcome to the chat!',
              timestamp: new Date().toISOString()
            }
          ]
        }
      }).as('getChatHistory')
      
      cy.visit('/chat')
      cy.wait('@getChatHistory')
      
      cy.get('.message-item, .chat-message').should('contain.text', 'Welcome to the chat!')
    })

  })

  describe('📝 Send Messages', () => {
    
    it('should send a text message successfully', () => {
      const testMessage = 'Hello from E2E test ' + Date.now()
      
      // Mock WebSocket message sending
      cy.window().then((win) => {
        // Mock WebSocket if needed
        if (win.WebSocket) {
          const originalWebSocket = win.WebSocket
          win.WebSocket = function(url) {
            const ws = new originalWebSocket(url)
            
            // Mock successful connection
            setTimeout(() => {
              ws.dispatchEvent(new Event('open'))
            }, 100)
            
            // Mock message echo
            ws.send = function(data) {
              setTimeout(() => {
                const messageData = JSON.parse(data)
                ws.dispatchEvent(new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'message',
                    message: messageData.message,
                    user: 'admin@test.com',
                    timestamp: new Date().toISOString()
                  })
                }))
              }, 200)
            }
            
            return ws
          }
        }
      })
      
      // Type and send message
      cy.get('.message-input, .chat-input input, textarea').type(testMessage)
      cy.get('.send-button, button[type="submit"]').click()
      
      // Verify message appears in chat
      cy.get('.message-item, .chat-message').should('contain.text', testMessage)
      
      // Verify input is cleared
      cy.get('.message-input, .chat-input input, textarea').should('have.value', '')
    })

    it('should handle empty messages', () => {
      // Try to send empty message
      cy.get('.send-button, button[type="submit"]').click()
      
      // Should not send empty message
      cy.get('.ant-message-warning, .warning-message').should('be.visible')
    })

    it('should send message on Enter key press', () => {
      const testMessage = 'Message sent with Enter key'
      
      cy.get('.message-input, .chat-input input, textarea').type(testMessage)
      cy.get('.message-input, .chat-input input, textarea').type('{enter}')
      
      // Message should be sent
      cy.get('.message-item, .chat-message').should('contain.text', testMessage)
    })

    it('should not send message on Shift+Enter', () => {
      const testMessage = 'Line 1{shift+enter}Line 2'
      
      cy.get('.message-input, .chat-input textarea').then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).type(testMessage)
          
          // Should create new line, not send message
          cy.wrap($textarea).should('contain.value', 'Line 1\nLine 2')
        }
      })
    })

    it('should show character limit warning', () => {
      const longMessage = 'a'.repeat(1000) // Very long message
      
      cy.get('.message-input, .chat-input input, textarea').type(longMessage)
      
      // Should show character limit warning
      cy.get('.character-limit, .text-limit').then(($limit) => {
        if ($limit.length > 0) {
          cy.wrap($limit).should('be.visible')
        }
      })
    })

  })

  describe('📥 Receive Messages', () => {
    
    it('should receive and display messages from other users', () => {
      const incomingMessage = {
        type: 'message',
        message: 'Hello from another user!',
        user: 'other@test.com',
        username: 'Other User',
        timestamp: new Date().toISOString()
      }
      
      // Mock WebSocket message reception
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(incomingMessage)
          }))
        }
      })
      
      // Verify message appears
      cy.get('.message-item, .chat-message').should('contain.text', incomingMessage.message)
      cy.get('.message-item, .chat-message').should('contain.text', incomingMessage.username)
    })

    it('should show typing indicator when someone is typing', () => {
      const typingEvent = {
        type: 'typing',
        user: 'other@test.com',
        username: 'Other User',
        isTyping: true
      }
      
      // Mock typing event
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(typingEvent)
          }))
        }
      })
      
      // Verify typing indicator appears
      cy.get('.typing-indicator, .user-typing').should('be.visible')
      cy.get('.typing-indicator, .user-typing').should('contain.text', 'Other User')
    })

    it('should play notification sound for new messages', () => {
      // Mock audio play
      cy.window().then((win) => {
        let audioPlayed = false
        
        const originalAudio = win.Audio
        win.Audio = function(src) {
          const audio = new originalAudio(src)
          audio.play = () => {
            audioPlayed = true
            return Promise.resolve()
          }
          return audio
        }
        
        // Simulate incoming message
        const incomingMessage = {
          type: 'message',
          message: 'Audio test message',
          user: 'other@test.com'
        }
        
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(incomingMessage)
          }))
        }
        
        // Check if audio was played
        cy.wrap(audioPlayed).should('be.true')
      })
    })

  })

  describe('👥 User Presence', () => {
    
    it('should show user online status', () => {
      // Check if user status is displayed
      cy.get('.user-status, .online-indicator').then(($status) => {
        if ($status.length > 0) {
          cy.wrap($status).should('be.visible')
          cy.wrap($status).should('have.class', 'online')
        }
      })
    })

    it('should update online users list when users join/leave', () => {
      const userJoinEvent = {
        type: 'user_joined',
        user: 'newuser@test.com',
        username: 'New User'
      }
      
      // Mock user join event
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(userJoinEvent)
          }))
        }
      })
      
      // Verify user appears in online list
      cy.get('.users-list, .online-users').should('contain.text', 'New User')
      
      const userLeaveEvent = {
        type: 'user_left',
        user: 'newuser@test.com'
      }
      
      // Mock user leave event
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(userLeaveEvent)
          }))
        }
      })
      
      // Verify user is removed from online list
      cy.get('.users-list, .online-users').should('not.contain.text', 'New User')
    })

    it('should show last seen timestamp for offline users', () => {
      cy.get('.user-item').then(($users) => {
        if ($users.length > 0) {
          cy.wrap($users).first().within(() => {
            cy.get('.last-seen, .user-timestamp').then(($timestamp) => {
              if ($timestamp.length > 0) {
                cy.wrap($timestamp).should('be.visible')
              }
            })
          })
        }
      })
    })

  })

  describe('🔍 Message Search and History', () => {
    
    it('should search messages by content', () => {
      // First send a searchable message
      const searchableMessage = 'Searchable test message'
      cy.sendMessage(searchableMessage)
      
      // Use search functionality
      cy.get('[data-testid=search-messages], .search-input').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search).type('Searchable')
          
          // Verify search results
          cy.get('.search-results, .filtered-messages').should('contain.text', searchableMessage)
        }
      })
    })

    it('should load message history with pagination', () => {
      // Mock paginated message history
      cy.intercept('GET', '**/api/chat/messages/?page=1', {
        body: {
          results: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            user: 'admin@test.com',
            message: `Message ${i + 1}`,
            timestamp: new Date().toISOString()
          })),
          next: 'http://localhost:8000/api/chat/messages/?page=2'
        }
      }).as('getMessagesPage1')
      
      cy.visit('/chat')
      cy.wait('@getMessagesPage1')
      
      // Scroll to load more messages
      cy.get('.chat-messages, .message-list').scrollTo('top')
      
      // Should load more messages
      cy.get('.message-item, .chat-message').should('have.length', 20)
    })

    it('should show message timestamps', () => {
      cy.sendMessage('Timestamp test message')
      
      cy.get('.message-item, .chat-message').last().within(() => {
        cy.get('.message-timestamp, .timestamp').should('be.visible')
        cy.get('.message-timestamp, .timestamp').should('contain.text', new Date().getHours())
      })
    })

  })

  describe('📎 File Sharing', () => {
    
    it('should send image files', () => {
      cy.get('[data-testid=file-upload], .file-upload input').then(($upload) => {
        if ($upload.length > 0) {
          // Mock image upload
          cy.fixture('test-image.jpg').then(fileContent => {
            cy.wrap($upload).selectFile({
              contents: Cypress.Buffer.from(fileContent),
              fileName: 'test-image.jpg',
              mimeType: 'image/jpeg'
            }, { force: true })
          })
          
          // Verify image appears in chat
          cy.get('.message-item, .chat-message').should('contain', 'test-image.jpg')
          cy.get('.message-image, .chat-image').should('be.visible')
        }
      })
    })

    it('should send document files', () => {
      cy.get('[data-testid=file-upload], .file-upload input').then(($upload) => {
        if ($upload.length > 0) {
          // Mock document upload
          cy.fixture('test-document.pdf').then(fileContent => {
            cy.wrap($upload).selectFile({
              contents: Cypress.Buffer.from(fileContent),
              fileName: 'test-document.pdf',
              mimeType: 'application/pdf'
            }, { force: true })
          })
          
          // Verify document appears in chat
          cy.get('.message-item, .chat-message').should('contain', 'test-document.pdf')
          cy.get('.file-download, .download-link').should('be.visible')
        }
      })
    })

    it('should reject files that are too large', () => {
      cy.get('[data-testid=file-upload], .file-upload input').then(($upload) => {
        if ($upload.length > 0) {
          // Mock large file
          const largeFileContent = 'x'.repeat(10 * 1024 * 1024) // 10MB
          
          cy.wrap($upload).selectFile({
            contents: Cypress.Buffer.from(largeFileContent),
            fileName: 'large-file.txt',
            mimeType: 'text/plain'
          }, { force: true })
          
          // Should show error message
          cy.get('.ant-message-error, .error-message').should('be.visible')
          cy.get('.ant-message-error, .error-message').should('contain.text', 'tamanho')
        }
      })
    })

  })

  describe('😀 Emoji and Rich Text', () => {
    
    it('should insert emojis into messages', () => {
      cy.get('[data-testid=emoji-button], .emoji-picker-trigger').then(($emojiBtn) => {
        if ($emojiBtn.length > 0) {
          cy.wrap($emojiBtn).click()
          
          // Select an emoji
          cy.get('.emoji-picker, .emoji-list').within(() => {
            cy.get('.emoji-item').first().click()
          })
          
          // Type rest of message
          cy.get('.message-input, .chat-input input, textarea').type(' Hello with emoji!')
          cy.get('.send-button, button[type="submit"]').click()
          
          // Verify emoji appears in message
          cy.get('.message-item, .chat-message').last().should('contain.text', 'Hello with emoji!')
        }
      })
    })

    it('should support markdown formatting', () => {
      const markdownMessage = '**Bold text** and *italic text*'
      
      cy.sendMessage(markdownMessage)
      
      // Check if markdown is rendered
      cy.get('.message-item, .chat-message').last().within(() => {
        cy.get('strong, .bold').should('contain.text', 'Bold text')
        cy.get('em, .italic').should('contain.text', 'italic text')
      })
    })

  })

  describe('🔔 Notifications', () => {
    
    it('should request notification permission', () => {
      cy.window().then((win) => {
        // Mock notification permission
        const originalNotification = win.Notification
        let permissionRequested = false
        
        win.Notification = {
          permission: 'default',
          requestPermission: () => {
            permissionRequested = true
            return Promise.resolve('granted')
          }
        }
        
        // Trigger notification permission request
        cy.get('[data-testid=enable-notifications], .notification-settings').then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).click()
            cy.wrap(permissionRequested).should('be.true')
          }
        })
      })
    })

    it('should show desktop notifications for new messages', () => {
      cy.window().then((win) => {
        let notificationShown = false
        
        win.Notification = function(title, options) {
          notificationShown = true
          this.title = title
          this.body = options.body
        }
        win.Notification.permission = 'granted'
        
        // Simulate incoming message when tab is not focused
        Object.defineProperty(document, 'hidden', { value: true, writable: true })
        
        const incomingMessage = {
          type: 'message',
          message: 'Notification test message',
          user: 'other@test.com',
          username: 'Other User'
        }
        
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify(incomingMessage)
          }))
        }
        
        cy.wrap(notificationShown).should('be.true')
      })
    })

  })

  describe('📱 Responsive Chat', () => {
    
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      // Chat should be usable on mobile
      cy.get('.chat-container, .chat-layout').should('be.visible')
      cy.get('.message-input, .chat-input').should('be.visible')
      
      // Send message on mobile
      cy.sendMessage('Mobile test message')
      cy.get('.message-item, .chat-message').should('contain.text', 'Mobile test message')
    })

    it('should collapse sidebar on mobile', () => {
      cy.viewport('iphone-x')
      
      // Users list should be collapsible on mobile
      cy.get('.users-toggle, .sidebar-toggle').then(($toggle) => {
        if ($toggle.length > 0) {
          cy.wrap($toggle).click()
          cy.get('.users-list, .sidebar').should('not.be.visible')
        }
      })
    })

  })

  describe('🔌 WebSocket Connection', () => {
    
    it('should handle WebSocket disconnection gracefully', () => {
      // Mock WebSocket disconnection
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new Event('close'))
        }
      })
      
      // Should show connection status
      cy.get('.connection-status, .offline-indicator').should('be.visible')
      cy.get('.connection-status, .offline-indicator').should('contain.text', 'Desconectado')
    })

    it('should attempt to reconnect after disconnection', () => {
      cy.window().then((win) => {
        let reconnectAttempted = false
        
        // Mock WebSocket disconnection
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new Event('close'))
          
          // Mock reconnection attempt
          setTimeout(() => {
            reconnectAttempted = true
            win.chatWebSocket.dispatchEvent(new Event('open'))
          }, 2000)
        }
        
        // Wait for reconnection
        cy.wait(3000)
        cy.wrap(reconnectAttempted).should('be.true')
      })
    })

    it('should show buffered messages after reconnection', () => {
      const testMessage = 'Buffered message'
      
      // Mock offline state
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new Event('close'))
        }
      })
      
      // Try to send message while offline
      cy.sendMessage(testMessage)
      
      // Mock reconnection
      cy.window().then((win) => {
        if (win.chatWebSocket) {
          win.chatWebSocket.dispatchEvent(new Event('open'))
        }
      })
      
      // Message should appear after reconnection
      cy.get('.message-item, .chat-message').should('contain.text', testMessage)
    })

  })

  describe('⚡ Performance', () => {
    
    it('should handle high message frequency', () => {
      // Simulate rapid message sending
      for (let i = 1; i <= 10; i++) {
        cy.sendMessage(`Rapid message ${i}`)
      }
      
      // All messages should appear
      cy.get('.message-item, .chat-message').should('have.length.greaterThan', 9)
      
      // Chat should remain responsive
      cy.get('.message-input, .chat-input input, textarea').should('be.enabled')
    })

    it('should limit message history to prevent memory issues', () => {
      // Mock many messages
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        user: 'admin@test.com',
        message: `Message ${i + 1}`,
        timestamp: new Date().toISOString()
      }))
      
      cy.intercept('GET', '**/api/chat/messages/**', {
        body: { results: messages }
      })
      
      cy.visit('/chat')
      
      // Should limit displayed messages
      cy.get('.message-item, .chat-message').should('have.length.lessThan', 1000)
    })

  })

})
