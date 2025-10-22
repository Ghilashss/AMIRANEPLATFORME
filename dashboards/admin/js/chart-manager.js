// Importation des modules nécessaires
import { Utils } from './utils.js';
import { DataStore } from './data-store.js';

export const ChartManager = {
    // Stockage des instances de graphiques
    charts: {},

    // Initialisation des graphiques du tableau de bord
    init() {
        this.initEvolutionChart();
        this.initWilayaChart();
        this.initAgenceChart();

        // Écouter l'événement updateCharts
        document.addEventListener('updateCharts', (event) => {
            this.updateCharts(event.detail);
        });
    },

    // Graphique d'évolution des livraisons (Line Chart)
    initEvolutionChart() {
        const ctx = document.getElementById('evolutionChart');
        if (!ctx) return;

        this.charts.evolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Livraisons',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#0b2b24',
                    tension: 0.1
                }, {
                    label: 'Retours',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    borderColor: '#ff0000',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    },

    // Graphique de répartition par wilaya (Bar Chart)
    initWilayaChart() {
        const ctx = document.getElementById('wilayaChart');
        if (!ctx) return;

        this.charts.wilaya = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'],
                datasets: [{
                    label: 'Nombre de colis',
                    data: [120, 90, 70, 60, 50],
                    backgroundColor: '#0b2b24'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    },

    // Graphique de performance des agences (Doughnut Chart)
    initAgenceChart() {
        const ctx = document.getElementById('agenceChart');
        if (!ctx) return;

        this.charts.agence = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent', 'Bon', 'Moyen', 'Faible'],
                datasets: [{
                    data: [35, 25, 22, 18],
                    backgroundColor: ['#00c851', '#0b2b24', '#ffa500', '#ff0000']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    },

    // Graphique des colis par statut (Pie Chart)
    initColisChart() {
        const ctx = document.getElementById('colisChart');
        if (!ctx) return;

        this.charts.colis = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['En attente', 'En cours', 'Livrés', 'Retournés', 'Annulés'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#ffd700', // En attente - Gold
                        '#1e90ff', // En cours - Blue
                        '#32cd32', // Livrés - Green
                        '#ff4500', // Retournés - Red
                        '#808080'  // Annulés - Gray
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: 'Répartition des Colis par Statut'
                    }
                }
            }
        });
    },

    // Graphique des revenus (Line Chart)
    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenus',
                    data: [],
                    borderColor: '#4CAF50',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution des Revenus'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' DA';
                            }
                        }
                    }
                }
            }
        });
    },

    // Graphique de performance des livraisons (Gauge Chart)
    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Succès', 'Restant'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [
                        '#4CAF50',
                        '#f5f5f5'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Taux de Livraison'
                    }
                },
                aspectRatio: 2
            }
        });
    },

    // Graphique des délais de livraison (Bar Chart)
    initDeliveryChart() {
        const ctx = document.getElementById('deliveryChart');
        if (!ctx) return;

        this.charts.delivery = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['<24h', '24-48h', '48-72h', '>72h'],
                datasets: [{
                    label: 'Nombre de Colis',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#32cd32',
                        '#ffd700',
                        '#ff8c00',
                        '#ff4500'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Délais de Livraison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // Mise à jour des graphiques avec les nouvelles données
    updateCharts(stats) {
        if (!stats) return;

        // Mise à jour du graphique d'évolution
        if (this.charts.evolution) {
            if (stats.evolution) {
                this.charts.evolution.data.labels = stats.evolution.dates || [];
                this.charts.evolution.data.datasets[0].data = stats.evolution.livraisons || [];
                this.charts.evolution.data.datasets[1].data = stats.evolution.retours || [];
                this.charts.evolution.update();
            }
        }

        // Mise à jour du graphique des wilayas
        if (this.charts.wilaya) {
            if (stats.wilayas) {
                this.charts.wilaya.data.labels = stats.wilayas.labels || [];
                this.charts.wilaya.data.datasets[0].data = stats.wilayas.data || [];
                this.charts.wilaya.update();
            }
        }

        // Mise à jour du graphique des agences
        if (this.charts.agence) {
            if (stats.agences) {
                this.charts.agence.data.labels = stats.agences.labels || [];
                this.charts.agence.data.datasets[0].data = stats.agences.data || [];
                this.charts.agence.update();
            }
        }
    },

    // Fonction pour détruire tous les graphiques (utile lors du nettoyage)
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }
};