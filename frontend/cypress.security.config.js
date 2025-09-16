// ===== CONFIGURAÇÃO CYPRESS PARA TESTES DE SEGURANÇA =====
// Arquivo: cypress.config.js (atualizado)

const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    
    // Configurações para testes de segurança
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 10000,
    defaultCommandTimeout: 10000,
    
    // Screenshots e vídeos para análise
    screenshotOnRunFailure: true,
    video: true,
    videoUploadOnPasses: false,
    
    // Configurações específicas para testes de segurança
    env: {
      // Credenciais para testes
      TEST_USER_EMAIL: 'admin@example.com',
      TEST_USER_PASSWORD: 'admin123',
      
      // URLs para diferentes ambientes
      API_URL: 'http://localhost:8000/api',
      
      // Configurações de teste
      RATE_LIMIT_TESTS: true,
      SECURITY_TESTS: true,
      PERFORMANCE_TESTS: true,
      
      // Timeouts específicos
      RATE_LIMIT_TIMEOUT: 60000, // 1 minuto
      PERFORMANCE_TIMEOUT: 30000, // 30 segundos
      
      // Thresholds
      MAX_RESPONSE_TIME: 2000,
      MAX_MEMORY_INCREASE: 10485760, // 10MB
      MIN_RATE_LIMIT_EFFECTIVENESS: 0.3 // 30%
    },
    
    // Configuração de testes por ambiente
    setupNodeEvents(on, config) {
      // Detectar ambiente
      const environment = config.env.NODE_ENV || 'development'
      
      if (environment === 'production') {
        // Configurações específicas para produção
        config.baseUrl = config.env.PRODUCTION_URL || 'https://your-domain.com'
        config.env.API_URL = config.env.PRODUCTION_API_URL || 'https://api.your-domain.com'
        config.env.STRICT_SECURITY = true
      }
      
      // Plugin para capturar métricas de performance
      on('task', {
        // Task para medir uso de memória
        measureMemory: (initialMemory) => {
          const currentMemory = process.memoryUsage().heapUsed
          return {
            initial: initialMemory,
            current: currentMemory,
            increase: currentMemory - initialMemory
          }
        },
        
        // Task para simular carga
        simulateLoad: async ({ url, requests = 10, concurrent = true }) => {
          const results = []
          const startTime = Date.now()
          
          if (concurrent) {
            // Requests simultâneos
            const promises = Array.from({ length: requests }, () =>
              fetch(url).then(r => ({ status: r.status, time: Date.now() }))
            )
            const responses = await Promise.all(promises)
            results.push(...responses)
          } else {
            // Requests sequenciais
            for (let i = 0; i < requests; i++) {
              const requestStart = Date.now()
              const response = await fetch(url)
              results.push({
                status: response.status,
                time: Date.now() - requestStart
              })
            }
          }
          
          return {
            results,
            totalTime: Date.now() - startTime,
            averageTime: results.reduce((sum, r) => sum + r.time, 0) / results.length,
            successRate: results.filter(r => r.status < 400).length / results.length
          }
        },
        
        // Task para validar headers de segurança
        validateSecurityHeaders: (headers) => {
          const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection'
          ]
          
          const productionHeaders = [
            'strict-transport-security',
            'content-security-policy'
          ]
          
          const missing = requiredHeaders.filter(header => !headers[header])
          const missingProduction = productionHeaders.filter(header => !headers[header])
          
          return {
            hasRequired: missing.length === 0,
            hasProduction: missingProduction.length === 0,
            missing,
            missingProduction
          }
        }
      })
      
      return config
    },
    
    // Especificar arquivos de teste
    specPattern: [
      'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
      'cypress/e2e/security-tests.cy.js',
      'cypress/e2e/performance-security-tests.cy.js',
      'cypress/e2e/production-readiness-tests.cy.js'
    ],
    
    // Configurações de retry para testes de segurança
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  
  // Configurações de component testing para testes unitários de segurança
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.security.cy.{js,jsx,ts,tsx}'
  }
})
