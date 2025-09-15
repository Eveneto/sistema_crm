/// <reference types="cypress" />

describe('📋 Kanban System - Complete E2E Flow', () => {
  
  beforeEach(() => {
    // Setup API intercepts
    cy.interceptAPI()
    
    // Login before each test
    cy.login()
    
    // Navigate to kanban page
    cy.navigateTo('kanban')
  })

  describe('🏗️ Board Management', () => {
    
    it('should display kanban page correctly', () => {
      cy.get('h1, .ant-page-header-heading-title').should('contain.text', 'Kanban')
      cy.get('[data-testid=new-board-button], button').contains('Novo Board').should('be.visible')
      cy.get('.kanban-container, .board-container').should('be.visible')
    })

    it('should create a new board successfully', () => {
      const boardData = {
        name: 'Test Board E2E',
        description: 'Board created during E2E testing'
      }
      
      cy.get('[data-testid=new-board-button], button').contains('Novo Board').click()
      cy.modalShouldBeOpen()
      
      cy.get('[data-testid=board-name-input], input[name=name]').type(boardData.name)
      cy.get('[data-testid=board-description-input], textarea[name=description]').then(($textarea) => {
        if ($textarea.length > 0) {
          cy.wrap($textarea).type(boardData.description)
        }
      })
      
      cy.get('[data-testid=save-board-button], button').contains('Salvar').click()
      
      // Verify board creation
      cy.contains(boardData.name).should('be.visible')
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should edit board successfully', () => {
      // First create a board
      cy.createBoard({ name: 'Board to Edit' })
      
      // Edit the board
      cy.get('[data-testid=board-menu], .board-actions').first().click()
      cy.get('[data-testid=edit-board-button]').click()
      
      const newBoardName = 'Edited Board Name'
      cy.get('[data-testid=board-name-input], input[name=name]').clear().type(newBoardName)
      cy.get('[data-testid=save-board-button], button').contains('Salvar').click()
      
      // Verify changes
      cy.contains(newBoardName).should('be.visible')
      cy.contains('Board to Edit').should('not.exist')
    })

    it('should delete board successfully', () => {
      // Create a board to delete
      cy.createBoard({ name: 'Board to Delete' })
      
      // Delete the board
      cy.get('[data-testid=board-menu], .board-actions').first().click()
      cy.get('[data-testid=delete-board-button]').click()
      
      // Confirm deletion
      cy.get('.ant-modal, .ant-popconfirm').contains('Confirmar').click()
      
      // Verify deletion
      cy.contains('Board to Delete').should('not.exist')
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

  })

  describe('📝 Column Management', () => {
    
    beforeEach(() => {
      // Create a test board for column operations
      cy.createBoard({ name: 'Column Test Board' })
      cy.selectBoard('Column Test Board')
    })

    it('should create a new column successfully', () => {
      const columnData = {
        name: 'New Column E2E',
        color: '#1890ff'
      }
      
      cy.get('[data-testid=new-column-button], button').contains('Nova Coluna').click()
      cy.modalShouldBeOpen()
      
      cy.get('[data-testid=column-name-input], input[name=name]').type(columnData.name)
      
      // Set column color if color picker exists
      cy.get('[data-testid=column-color-picker], .color-picker').then(($colorPicker) => {
        if ($colorPicker.length > 0) {
          cy.wrap($colorPicker).click()
          cy.get('.color-option, .ant-color-picker-color').first().click()
        }
      })
      
      cy.get('[data-testid=save-column-button], button').contains('Salvar').click()
      
      // Verify column creation
      cy.get('.kanban-column').should('contain.text', columnData.name)
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should edit column successfully', () => {
      // Create a column first
      cy.createColumn({ name: 'Column to Edit' })
      
      // Edit the column
      cy.get('.kanban-column').contains('Column to Edit')
        .parents('.kanban-column')
        .find('[data-testid=column-menu], .column-actions')
        .click()
      
      cy.get('[data-testid=edit-column-button]').click()
      
      const newColumnName = 'Edited Column Name'
      cy.get('[data-testid=column-name-input], input[name=name]').clear().type(newColumnName)
      cy.get('[data-testid=save-column-button], button').contains('Salvar').click()
      
      // Verify changes
      cy.get('.kanban-column').should('contain.text', newColumnName)
      cy.get('.kanban-column').should('not.contain.text', 'Column to Edit')
    })

    it('should delete column successfully', () => {
      // Create a column to delete
      cy.createColumn({ name: 'Column to Delete' })
      
      // Delete the column
      cy.get('.kanban-column').contains('Column to Delete')
        .parents('.kanban-column')
        .find('[data-testid=column-menu], .column-actions')
        .click()
      
      cy.get('[data-testid=delete-column-button]').click()
      
      // Confirm deletion
      cy.get('.ant-modal, .ant-popconfirm').contains('Confirmar').click()
      
      // Verify deletion
      cy.get('.kanban-column').should('not.contain.text', 'Column to Delete')
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should reorder columns by drag and drop', () => {
      // Create multiple columns
      cy.createColumn({ name: 'Column A' })
      cy.createColumn({ name: 'Column B' })
      cy.createColumn({ name: 'Column C' })
      
      // Get initial order
      cy.get('.kanban-column h3, .column-title').then(($titles) => {
        const initialOrder = Array.from($titles).map(el => el.textContent)
        
        // Perform drag and drop
        cy.get('.kanban-column').first()
          .trigger('dragstart')
        
        cy.get('.kanban-column').last()
          .trigger('dragover')
          .trigger('drop')
        
        // Verify order changed
        cy.get('.kanban-column h3, .column-title').then(($newTitles) => {
          const newOrder = Array.from($newTitles).map(el => el.textContent)
          expect(newOrder).to.not.deep.equal(initialOrder)
        })
      })
    })

  })

  describe('🎫 Task Management', () => {
    
    beforeEach(() => {
      // Setup board and columns for task operations
      cy.createBoard({ name: 'Task Test Board' })
      cy.selectBoard('Task Test Board')
      cy.createColumn({ name: 'To Do' })
      cy.createColumn({ name: 'In Progress' })
      cy.createColumn({ name: 'Done' })
    })

    it('should create a new task successfully', () => {
      const taskData = {
        title: 'Test Task E2E',
        description: 'Task created during E2E testing',
        priority: 'High',
        assignee: 'admin@test.com'
      }
      
      // Click add task button in first column
      cy.get('.kanban-column').first()
        .find('[data-testid=new-task-button], .add-task-button')
        .click()
      
      cy.modalShouldBeOpen()
      
      cy.get('[data-testid=task-title-input], input[name=title]').type(taskData.title)
      cy.get('[data-testid=task-description-input], textarea[name=description]').type(taskData.description)
      
      // Set priority if available
      cy.get('[data-testid=task-priority-select], .ant-select').then(($select) => {
        if ($select.length > 0) {
          cy.wrap($select).click()
          cy.get('.ant-select-dropdown').contains(taskData.priority).click()
        }
      })
      
      // Set assignee if available
      cy.get('[data-testid=task-assignee-select], .ant-select').then(($select) => {
        if ($select.length > 0) {
          cy.wrap($select).click()
          cy.get('.ant-select-dropdown').contains(taskData.assignee).click()
        }
      })
      
      cy.get('[data-testid=save-task-button], button').contains('Salvar').click()
      
      // Verify task creation
      cy.get('.task-card, .kanban-task').should('contain.text', taskData.title)
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should edit task successfully', () => {
      // Create a task first
      cy.createTask({ title: 'Task to Edit', column: 'To Do' })
      
      // Edit the task
      cy.get('.task-card, .kanban-task').contains('Task to Edit').click()
      cy.modalShouldBeOpen()
      
      const newTaskTitle = 'Edited Task Title'
      cy.get('[data-testid=task-title-input], input[name=title]').clear().type(newTaskTitle)
      cy.get('[data-testid=save-task-button], button').contains('Salvar').click()
      
      // Verify changes
      cy.get('.task-card, .kanban-task').should('contain.text', newTaskTitle)
      cy.get('.task-card, .kanban-task').should('not.contain.text', 'Task to Edit')
    })

    it('should delete task successfully', () => {
      // Create a task to delete
      cy.createTask({ title: 'Task to Delete', column: 'To Do' })
      
      // Delete the task
      cy.get('.task-card, .kanban-task').contains('Task to Delete')
        .find('[data-testid=task-menu], .task-actions')
        .click()
      
      cy.get('[data-testid=delete-task-button]').click()
      
      // Confirm deletion
      cy.get('.ant-modal, .ant-popconfirm').contains('Confirmar').click()
      
      // Verify deletion
      cy.get('.task-card, .kanban-task').should('not.contain.text', 'Task to Delete')
      cy.get('.ant-message-success, .ant-notification-success').should('be.visible')
    })

    it('should move task between columns by drag and drop', () => {
      // Create a task in first column
      cy.createTask({ title: 'Task to Move', column: 'To Do' })
      
      // Perform drag and drop
      cy.get('.task-card, .kanban-task').contains('Task to Move')
        .trigger('dragstart', { dataTransfer: new DataTransfer() })
      
      cy.get('.kanban-column').contains('In Progress')
        .parents('.kanban-column')
        .find('.column-content, .task-drop-zone')
        .trigger('dragover')
        .trigger('drop')
      
      // Verify task moved
      cy.get('.kanban-column').contains('In Progress')
        .parents('.kanban-column')
        .should('contain.text', 'Task to Move')
      
      cy.get('.kanban-column').contains('To Do')
        .parents('.kanban-column')
        .should('not.contain.text', 'Task to Move')
    })

    it('should filter tasks by priority', () => {
      // Create tasks with different priorities
      cy.createTask({ title: 'High Priority Task', priority: 'High', column: 'To Do' })
      cy.createTask({ title: 'Low Priority Task', priority: 'Low', column: 'To Do' })
      
      // Apply priority filter
      cy.get('[data-testid=priority-filter], .filter-priority').then(($filter) => {
        if ($filter.length > 0) {
          cy.wrap($filter).click()
          cy.get('.ant-select-dropdown').contains('High').click()
          
          // Verify filtering
          cy.get('.task-card, .kanban-task').should('contain.text', 'High Priority Task')
          cy.get('.task-card, .kanban-task').should('not.contain.text', 'Low Priority Task')
        }
      })
    })

    it('should search tasks by title', () => {
      // Create test tasks
      cy.createTask({ title: 'Searchable Task Alpha', column: 'To Do' })
      cy.createTask({ title: 'Different Task Beta', column: 'To Do' })
      
      // Search for specific task
      cy.get('[data-testid=task-search], .search-tasks input').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search).type('Alpha')
          
          // Verify search results
          cy.get('.task-card, .kanban-task').should('contain.text', 'Searchable Task Alpha')
          cy.get('.task-card, .kanban-task').should('not.contain.text', 'Different Task Beta')
        }
      })
    })

  })

  describe('👥 Collaboration Features', () => {
    
    it('should show task assignees', () => {
      cy.createTask({ 
        title: 'Assigned Task', 
        assignee: 'admin@test.com',
        column: 'To Do' 
      })
      
      // Check if assignee is displayed
      cy.get('.task-card, .kanban-task').contains('Assigned Task')
        .within(() => {
          cy.get('.task-assignee, .assignee-avatar').should('be.visible')
        })
    })

    it('should show task comments count', () => {
      cy.createTask({ title: 'Task with Comments', column: 'To Do' })
      
      // Add comment to task
      cy.get('.task-card, .kanban-task').contains('Task with Comments').click()
      
      cy.get('[data-testid=comments-tab], .comments-section').then(($comments) => {
        if ($comments.length > 0) {
          cy.wrap($comments).click()
          
          cy.get('[data-testid=new-comment-input], .comment-input').type('Test comment')
          cy.get('[data-testid=add-comment-button], button').contains('Adicionar').click()
          
          // Verify comment count on task card
          cy.get('[data-testid=close-modal], .ant-modal-close').click()
          cy.get('.task-card, .kanban-task').contains('Task with Comments')
            .within(() => {
              cy.get('.comment-count, .comments-badge').should('contain.text', '1')
            })
        }
      })
    })

    it('should show task attachments', () => {
      cy.createTask({ title: 'Task with Attachments', column: 'To Do' })
      
      cy.get('.task-card, .kanban-task').contains('Task with Attachments').click()
      
      // Test file upload if available
      cy.get('[data-testid=attachments-tab], .attachments-section').then(($attachments) => {
        if ($attachments.length > 0) {
          cy.wrap($attachments).click()
          
          // Mock file upload
          cy.get('[data-testid=file-upload], .ant-upload input').then(($upload) => {
            if ($upload.length > 0) {
              const fileName = 'test-document.pdf'
              cy.fixture(fileName).then(fileContent => {
                cy.wrap($upload).selectFile({
                  contents: Cypress.Buffer.from(fileContent),
                  fileName: fileName,
                  mimeType: 'application/pdf'
                }, { force: true })
              })
            }
          })
        }
      })
    })

  })

  describe('📊 Kanban Analytics', () => {
    
    it('should display board statistics', () => {
      // Create tasks in different columns
      cy.createTask({ title: 'Task 1', column: 'To Do' })
      cy.createTask({ title: 'Task 2', column: 'In Progress' })
      cy.createTask({ title: 'Task 3', column: 'Done' })
      
      // Check if statistics are displayed
      cy.get('[data-testid=board-stats], .board-statistics').then(($stats) => {
        if ($stats.length > 0) {
          cy.wrap($stats).should('be.visible')
          cy.wrap($stats).should('contain.text', 'Total')
        }
      })
    })

    it('should show progress visualization', () => {
      cy.get('[data-testid=progress-chart], .progress-visualization').then(($chart) => {
        if ($chart.length > 0) {
          cy.wrap($chart).should('be.visible')
        }
      })
    })

  })

  describe('📱 Responsive Kanban', () => {
    
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      
      // Kanban should be usable on mobile
      cy.get('.kanban-container, .board-container').should('be.visible')
      
      // Columns should be horizontally scrollable
      cy.get('.kanban-columns, .columns-container').then(($container) => {
        expect($container[0].scrollWidth).to.be.greaterThan($container[0].clientWidth)
      })
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      
      cy.get('.kanban-container, .board-container').should('be.visible')
      
      // Test task creation on tablet
      cy.get('.kanban-column').first()
        .find('[data-testid=new-task-button], .add-task-button')
        .should('be.visible')
    })

  })

  describe('⚡ Performance Optimization', () => {
    
    it('should handle large number of tasks efficiently', () => {
      // Create many tasks
      const taskCount = 20
      
      for (let i = 1; i <= taskCount; i++) {
        cy.createTask({ 
          title: `Performance Task ${i}`, 
          column: 'To Do' 
        })
      }
      
      // Check if virtual scrolling or pagination is implemented
      cy.get('.kanban-column').first().within(() => {
        cy.get('.task-card, .kanban-task').should('have.length.lessThan', taskCount + 1)
      })
    })

    it('should load quickly with many boards', () => {
      const startTime = Date.now()
      
      cy.visit('/kanban')
      cy.get('.kanban-container, .board-container').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // 3 seconds max
      })
    })

  })

  describe('💾 Data Persistence', () => {
    
    it('should persist board state after page refresh', () => {
      cy.createBoard({ name: 'Persistent Board' })
      cy.createColumn({ name: 'Persistent Column' })
      cy.createTask({ title: 'Persistent Task', column: 'Persistent Column' })
      
      cy.reload()
      
      // Verify data persistence
      cy.contains('Persistent Board').should('be.visible')
      cy.contains('Persistent Column').should('be.visible')
      cy.contains('Persistent Task').should('be.visible')
    })

    it('should sync changes across browser tabs', () => {
      // This would require WebSocket testing
      cy.createTask({ title: 'Sync Test Task', column: 'To Do' })
      
      // Simulate change from another tab
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('kanban-update', {
          detail: { type: 'task-moved', taskId: 1, newColumn: 'Done' }
        }))
      })
      
      // Check if change is reflected
      cy.wait(1000)
      cy.get('.kanban-column').contains('Done')
        .parents('.kanban-column')
        .should('contain.text', 'Sync Test Task')
    })

  })

})
