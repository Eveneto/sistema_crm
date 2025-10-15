// Dashboard Page Loader
async function loadDashboard() {
    $('#page-content').html(`
        <div class="container-fluid">
            <!-- Page Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="h3 mb-1">Dashboard</h1>
                    <p class="text-muted">Visão geral do seu sistema de gestão</p>
                </div>
            </div>
            
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="stats-card bg-gradient-primary">
                        <div class="stats-icon">
                            <i class="bi bi-building"></i>
                        </div>
                        <div class="stats-number" id="companies-count">-</div>
                        <div class="stats-label">Empresas Cadastradas</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="stats-card bg-gradient-success">
                        <div class="stats-icon">
                            <i class="bi bi-kanban"></i>
                        </div>
                        <div class="stats-number" id="tasks-count">-</div>
                        <div class="stats-label">Tasks Ativas</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="stats-card bg-gradient-warning">
                        <div class="stats-icon">
                            <i class="bi bi-chat-dots"></i>
                        </div>
                        <div class="stats-number" id="messages-count">-</div>
                        <div class="stats-label">Mensagens Enviadas</div>
                    </div>
                </div>
                
                <div class="col-xl-3 col-md-6 mb-3">
                    <div class="stats-card bg-gradient-danger">
                        <div class="stats-icon">
                            <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="stats-number" id="revenue-count">-</div>
                        <div class="stats-label">Faturamento</div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div class="row mb-4">
                <div class="col-xl-8 mb-4">
                    <div class="chart-card">
                        <h5><i class="bi bi-graph-up me-2"></i>Crescimento Mensal</h5>
                        <div class="chart-container">
                            <canvas id="growth-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-4 mb-4">
                    <div class="chart-card">
                        <h5><i class="bi bi-pie-chart me-2"></i>Status do Pipeline</h5>
                        <div class="chart-container">
                            <canvas id="pipeline-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Activity and Performance Row -->
            <div class="row">
                <div class="col-xl-6 mb-4">
                    <div class="chart-card">
                        <h5><i class="bi bi-bar-chart me-2"></i>Atividade por Módulo</h5>
                        <div class="chart-container">
                            <canvas id="activity-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="col-xl-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Atividades Recentes</h5>
                        </div>
                        <div class="card-body p-0">
                            <div id="recent-activities"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="bi bi-lightning me-2"></i>Ações Rápidas</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-outline-primary w-100" data-page="companies">
                                        <i class="bi bi-plus-circle me-2"></i>Nova Empresa
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-outline-success w-100" data-page="kanban">
                                        <i class="bi bi-plus-circle me-2"></i>Nova Task
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-outline-info w-100" data-page="communities">
                                        <i class="bi bi-plus-circle me-2"></i>Nova Comunidade
                                    </button>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <button class="btn btn-outline-warning w-100" data-page="chat">
                                        <i class="bi bi-chat-dots me-2"></i>Abrir Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);

    // Carregar dados do dashboard
    await loadDashboardData();
    
    // Inicializar gráficos
    initializeDashboardCharts();
    
    // Carregar atividades recentes
    loadRecentActivities();
}

// Carregar dados das estatísticas
async function loadDashboardData() {
    try {
        const stats = await window.api.getDashboardStats();
        
        // Atualizar contadores com animação
        animateCounter('#companies-count', stats.companies);
        animateCounter('#tasks-count', stats.tasks);
        animateCounter('#messages-count', stats.messages);
        
        // Formatar e exibir faturamento
        $('#revenue-count').text(formatCurrency(stats.revenue));
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showToast('Erro ao carregar estatísticas', 'error');
        
        // Valores padrão em caso de erro
        $('#companies-count').text('0');
        $('#tasks-count').text('0');
        $('#messages-count').text('0');
        $('#revenue-count').text('R$ 0');
    }
}

// Animar contadores
function animateCounter(selector, targetValue) {
    const element = $(selector);
    const startValue = 0;
    const duration = 2000; // 2 segundos
    const increment = targetValue / (duration / 16); // 60 FPS
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.text(Math.floor(currentValue));
    }, 16);
}

// Inicializar gráficos
function initializeDashboardCharts() {
    // Gráfico de crescimento mensal
    const growthCtx = document.getElementById('growth-chart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Empresas Cadastradas',
                    data: [5, 8, 12, 18, 22, 25, 28],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0d6efd',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Deals Fechados',
                    data: [2, 4, 7, 11, 15, 19, 23],
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#198754',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Meses'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Quantidade'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });

    // Gráfico de pizza - Status do Pipeline
    const pipelineCtx = document.getElementById('pipeline-chart').getContext('2d');
    new Chart(pipelineCtx, {
        type: 'doughnut',
        data: {
            labels: ['A Fazer', 'Em Progresso', 'Revisão', 'Concluído'],
            datasets: [{
                data: [30, 45, 15, 25],
                backgroundColor: [
                    '#dc3545',
                    '#ffc107', 
                    '#fd7e14',
                    '#198754'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Gráfico de barras - Atividade por Módulo
    const activityCtx = document.getElementById('activity-chart').getContext('2d');
    new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Empresas', 'Kanban', 'Chat', 'Comunidades'],
            datasets: [{
                label: 'Atividade Diária',
                data: [25, 87, 64, 18],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.8)',
                    'rgba(25, 135, 84, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    '#0d6efd',
                    '#198754',
                    '#ffc107',
                    '#dc3545'
                ],
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed.y} atividades`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Atividades'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Módulos'
                    }
                }
            }
        }
    });
}

// Carregar atividades recentes
function loadRecentActivities() {
    const activities = [
        {
            id: 1,
            title: 'Nova empresa cadastrada',
            description: 'TechStart Solutions foi adicionada ao sistema',
            time: 'há 5 minutos',
            icon: 'bi-building',
            iconColor: 'text-primary'
        },
        {
            id: 2,
            title: 'Task movida para "Concluído"',
            description: 'Proposta comercial finalizada com sucesso',
            time: 'há 15 minutos',
            icon: 'bi-check-circle',
            iconColor: 'text-success'
        },
        {
            id: 3,
            title: 'Nova mensagem no chat',
            description: 'Discussão sobre próximos passos do projeto Alpha',
            time: 'há 30 minutos',
            icon: 'bi-chat-dots',
            iconColor: 'text-warning'
        },
        {
            id: 4,
            title: 'Novo membro na comunidade',
            description: 'Ana Rodrigues se juntou à equipe de vendas',
            time: 'há 1 hora',
            icon: 'bi-person-plus',
            iconColor: 'text-info'
        },
        {
            id: 5,
            title: 'Relatório gerado',
            description: 'Relatório mensal de vendas foi criado automaticamente',
            time: 'há 2 horas',
            icon: 'bi-file-earmark-text',
            iconColor: 'text-secondary'
        }
    ];

    const activitiesHtml = activities.map(activity => `
        <div class="activity-item d-flex">
            <div class="activity-icon ${activity.iconColor}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${activity.title}</h6>
                <p class="mb-1 text-muted small">${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');

    $('#recent-activities').html(activitiesHtml);
}

// Registrar página do dashboard
window.navigation.registerPage('dashboard', loadDashboard);
