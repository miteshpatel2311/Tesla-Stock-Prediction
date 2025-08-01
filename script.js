// Tesla Stock Prediction Dashboard JavaScript
// Global variables and configuration
let charts = {};
let currentSection = 'overview';

// Project data from the Colab analysis
const projectData = {
    metadata: {
        ticker: 'TSLA',
        analysisDate: '2025-07-31',
        dataPeriod: '2023-02-14 to 2025-07-29',
        totalDays: 615,
        testDays: 30,
        featuresUsed: ['Open', 'High', 'Low', 'Close', 'Volume', 'Sentiment_Mean', 'RSI', 'Volatility'],
        sentimentModel: 'FinBERT'
    },
    
    stockSummary: {
        currentPrice: 321.20,
        periodHigh: 488.54,
        periodLow: 138.80,
        totalReturnPct: 53.5,
        averageVolume: 110426299,
        priceVolatility: 67.26
    },
    
    sentimentAnalysis: {
        averageSentiment: -0.013,
        sentimentRange: [-0.996, 0.267],
        priceSentimentCorrelation: -0.1167,
        correlationStrength: 'Weak',
        correlationDirection: 'Negative'
    },
    
    modelPerformance: {
        arima: {
            mse: 182.02,
            mae: 10.35,
            rmse: 13.49,
            mape: 3.31,
            r2Score: -0.1925,
            directionalAccuracy: 41.4
        },
        lstm: {
            mse: 240.47,
            mae: 12.75,
            rmse: 15.51,
            mape: 3.95,
            r2Score: -0.5754,
            directionalAccuracy: 51.7
        },
        hybrid: {
            mse: 130.21,
            mae: 8.43,
            rmse: 11.41,
            mape: 2.64,
            r2Score: 0.1469,
            directionalAccuracy: 51.7
        }
    },
    
    futurePredictions: [
        { date: '2025-07-30', price: 313.80, change: -2.3, confidence: 90 },
        { date: '2025-07-31', price: 312.19, change: -2.8, confidence: 82 },
        { date: '2025-08-01', price: 310.74, change: -3.3, confidence: 74 },
        { date: '2025-08-04', price: 312.40, change: -2.7, confidence: 66 },
        { date: '2025-08-05', price: 313.58, change: -2.4, confidence: 60 }
    ],
    
    tradingIndicators: {
        currentRSI: 46.82,
        recentSentiment: -0.465,
        currentVolatility: 0.043
    }
};

// Utility functions
function generateDateLabels(startDate, endDate, count) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const interval = Math.floor((end - start) / (count - 1));
    
    for (let i = 0; i < count; i++) {
        const date = new Date(start.getTime() + (interval * i));
        dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return dates;
}

// Sample stock price data for charts
const stockPriceData = {
    labels: generateDateLabels('2025-06-01', '2025-07-29', 30),
    prices: [280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340, 335, 330, 325, 320, 315, 320, 325, 330, 325, 320, 315, 310, 315, 320, 325, 321, 321],
    ma10: [282, 287, 292, 297, 302, 307, 312, 317, 322, 327, 332, 337, 338, 336, 332, 327, 322, 317, 318, 322, 327, 326, 322, 317, 312, 313, 317, 322, 320, 320],
    ma30: [285, 288, 291, 294, 297, 300, 303, 306, 309, 312, 315, 318, 320, 322, 324, 325, 324, 322, 320, 319, 320, 321, 321, 320, 318, 317, 318, 319, 320, 320],
    volume: [120000000, 110000000, 95000000, 105000000, 130000000, 115000000, 100000000, 125000000, 140000000, 110000000, 95000000, 120000000, 135000000, 150000000, 160000000, 145000000, 130000000, 115000000, 120000000, 135000000, 125000000, 115000000, 105000000, 110000000, 125000000, 140000000, 130000000, 115000000, 110000000, 87358900]
};

// Sentiment data
const sentimentData = {
    labels: stockPriceData.labels,
    sentiment: [-0.2, -0.1, 0.1, 0.3, -0.4, -0.2, 0.0, 0.2, -0.3, -0.1, 0.1, -0.5, -0.6, -0.4, -0.2, 0.0, 0.1, -0.1, 0.3, -0.2, -0.4, -0.5, -0.3, 0.2, 0.0, -0.1, -0.9, 0.0, -0.5, -0.1]
};

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

function formatLargeNumber(value) {
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

// Chart configuration
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#b3b3b3',
                font: {
                    family: 'Inter'
                }
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: '#666666',
                font: {
                    family: 'Inter'
                }
            },
            grid: {
                color: '#333333'
            }
        },
        y: {
            ticks: {
                color: '#666666',
                font: {
                    family: 'Inter'
                }
            },
            grid: {
                color: '#333333'
            }
        }
    }
};

// Chart creation functions
function createPriceChart() {
    const ctx = document.getElementById('price-chart');
    if (!ctx) return;

    charts.priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stockPriceData.labels,
            datasets: [
                {
                    label: 'Close Price',
                    data: stockPriceData.prices,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'MA 10',
                    data: stockPriceData.ma10,
                    borderColor: '#00ff88',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'MA 30',
                    data: stockPriceData.ma30,
                    borderColor: '#ffaa00',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Price ($)',
                        color: '#b3b3b3'
                    }
                }
            }
        }
    });
}

function createVolumeChart() {
    const ctx = document.getElementById('volume-chart');
    if (!ctx) return;

    charts.volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stockPriceData.labels,
            datasets: [{
                label: 'Volume',
                data: stockPriceData.volume,
                backgroundColor: 'rgba(0, 212, 255, 0.6)',
                borderColor: '#00d4ff',
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Volume',
                        color: '#b3b3b3'
                    },
                    ticks: {
                        ...chartDefaults.scales.y.ticks,
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function createSentimentChart() {
    const ctx = document.getElementById('sentiment-chart');
    if (!ctx) return;

    charts.sentimentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sentimentData.labels,
            datasets: [
                {
                    label: 'Stock Price',
                    data: stockPriceData.prices,
                    borderColor: '#00d4ff',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.4
                },
                {
                    label: 'Sentiment Score',
                    data: sentimentData.sentiment,
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: chartDefaults.scales.x,
                y: {
                    ...chartDefaults.scales.y,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Price ($)',
                        color: '#b3b3b3'
                    }
                },
                y1: {
                    ...chartDefaults.scales.y,
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Sentiment Score',
                        color: '#b3b3b3'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function createModelComparisonChart() {
    const ctx = document.getElementById('model-comparison-chart');
    if (!ctx) return;

    const models = Object.keys(projectData.modelPerformance);
    const mseData = models.map(model => projectData.modelPerformance[model].mse);
    const maeData = models.map(model => projectData.modelPerformance[model].mae);
    const mapeData = models.map(model => projectData.modelPerformance[model].mape);

    charts.modelComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models.map(m => m.toUpperCase()),
            datasets: [
                {
                    label: 'MSE',
                    data: mseData,
                    backgroundColor: 'rgba(0, 212, 255, 0.6)',
                    borderColor: '#00d4ff',
                    borderWidth: 1
                },
                {
                    label: 'MAE',
                    data: maeData,
                    backgroundColor: 'rgba(0, 255, 136, 0.6)',
                    borderColor: '#00ff88',
                    borderWidth: 1
                },
                {
                    label: 'MAPE (%)',
                    data: mapeData,
                    backgroundColor: 'rgba(255, 170, 0, 0.6)',
                    borderColor: '#ffaa00',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Error Value',
                        color: '#b3b3b3'
                    }
                }
            }
        }
    });
}

function createPredictionChart() {
    const ctx = document.getElementById('prediction-chart');
    if (!ctx) return;

    // Sample prediction vs actual data for the last 30 days
    const actualPrices = stockPriceData.prices.slice(-30);
    const arimaPredict = actualPrices.map(price => price + (Math.random() - 0.5) * 20);
    const lstmPredict = actualPrices.map(price => price + (Math.random() - 0.5) * 15);
    const hybridPredict = actualPrices.map(price => price + (Math.random() - 0.5) * 10);

    charts.predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: stockPriceData.labels.slice(-30),
            datasets: [
                {
                    label: 'Actual',
                    data: actualPrices,
                    borderColor: '#ffffff',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 4
                },
                {
                    label: 'ARIMA',
                    data: arimaPredict,
                    borderColor: '#ff4444',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 2
                },
                {
                    label: 'LSTM',
                    data: lstmPredict,
                    borderColor: '#4dabf7',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    pointRadius: 2
                },
                {
                    label: 'Hybrid',
                    data: hybridPredict,
                    borderColor: '#00ff88',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [15, 5],
                    pointRadius: 2
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Price ($)',
                        color: '#b3b3b3'
                    }
                }
            }
        }
    });
}

function createForecastChart() {
    const ctx = document.getElementById('forecast-chart');
    if (!ctx) return;

    const historicalPrices = stockPriceData.prices.slice(-10);
    const futurePrices = projectData.futurePredictions.map(pred => pred.price);
    const allPrices = [...historicalPrices, ...futurePrices];
    
    const historicalLabels = stockPriceData.labels.slice(-10);
    const futureLabels = projectData.futurePredictions.map(pred => {
        const date = new Date(pred.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const allLabels = [...historicalLabels, ...futureLabels];

    charts.forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Historical',
                    data: [...historicalPrices, ...Array(futurePrices.length).fill(null)],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Forecast',
                    data: [...Array(historicalPrices.length).fill(null), ...futurePrices],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 3,
                    borderDash: [10, 5],
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Price ($)',
                        color: '#b3b3b3'
                    }
                }
            },
            plugins: {
                ...chartDefaults.plugins,
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: historicalLabels.length - 1,
                            xMax: historicalLabels.length - 1,
                            borderColor: '#666666',
                            borderWidth: 2,
                            borderDash: [5, 5]
                        }
                    }
                }
            }
        }
    });
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update active section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            currentSection = targetSection;
            
            // Initialize charts for the active section
            setTimeout(() => {
                initializeChartsForSection(targetSection);
            }, 100);
        });
    });
}

function initializeChartsForSection(section) {
    switch (section) {
        case 'overview':
            if (!charts.priceChart) createPriceChart();
            break;
        case 'analysis':
            if (!charts.volumeChart) createVolumeChart();
            if (!charts.sentimentChart) createSentimentChart();
            break;
        case 'models':
            if (!charts.modelComparisonChart) createModelComparisonChart();
            if (!charts.predictionChart) createPredictionChart();
            break;
        case 'predictions':
            if (!charts.forecastChart) createForecastChart();
            break;
    }
}

// Dynamic content updates
function updateMetrics() {
    // Update current price
    const currentPriceElement = document.getElementById('current-price');
    if (currentPriceElement) {
        currentPriceElement.textContent = formatCurrency(projectData.stockSummary.currentPrice);
    }

    // Update RSI value and bar
    const rsiValueElement = document.getElementById('rsi-value');
    if (rsiValueElement) {
        rsiValueElement.textContent = formatNumber(projectData.tradingIndicators.currentRSI, 2);
        
        const rsiBar = rsiValueElement.parentElement.querySelector('.indicator-fill');
        if (rsiBar) {
            rsiBar.style.width = `${projectData.tradingIndicators.currentRSI}%`;
        }
    }
}

function createCorrelationMatrix() {
    const correlationContainer = document.getElementById('correlation-matrix');
    if (!correlationContainer) return;

    // Sample correlation data
    const correlations = {
        'Close': { 'Open': 0.99, 'High': 0.99, 'Low': 0.99, 'Volume': 0.15, 'Sentiment': -0.12, 'RSI': 0.26 },
        'Open': { 'Close': 0.99, 'High': 0.98, 'Low': 0.98, 'Volume': 0.14, 'Sentiment': -0.11, 'RSI': 0.25 },
        'High': { 'Close': 0.99, 'Open': 0.98, 'Low': 0.97, 'Volume': 0.16, 'Sentiment': -0.10, 'RSI': 0.27 },
        'Low': { 'Close': 0.99, 'Open': 0.98, 'High': 0.97, 'Volume': 0.13, 'Sentiment': -0.13, 'RSI': 0.24 },
        'Volume': { 'Close': 0.15, 'Open': 0.14, 'High': 0.16, 'Low': 0.13, 'Sentiment': 0.08, 'RSI': -0.05 },
        'Sentiment': { 'Close': -0.12, 'Open': -0.11, 'High': -0.10, 'Low': -0.13, 'Volume': 0.08, 'RSI': -0.02 }
    };

    const features = Object.keys(correlations);
    let html = '<div class="correlation-header">';
    html += '<div class="correlation-cell"></div>';
    features.forEach(feature => {
        html += `<div class="correlation-cell">${feature}</div>`;
    });
    html += '</div>';

    features.forEach(rowFeature => {
        html += '<div class="correlation-row">';
        html += `<div class="correlation-cell">${rowFeature}</div>`;
        features.forEach(colFeature => {
            const correlation = correlations[rowFeature][colFeature] || 0;
            const intensity = Math.abs(correlation);
            const color = correlation > 0 ? 'positive' : 'negative';
            html += `<div class="correlation-cell correlation-value ${color}" style="opacity: ${intensity}">
                        ${formatNumber(correlation, 2)}
                     </div>`;
        });
        html += '</div>';
    });

    correlationContainer.innerHTML = html;
}

// Animation and interaction effects
function addInteractiveEffects() {
    // Add hover effects to metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Add click effects to prediction cards
    const predictionCards = document.querySelectorAll('.prediction-card');
    predictionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Real-time updates simulation
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Simulate small price changes
        const currentPrice = projectData.stockSummary.currentPrice;
        const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
        const newPrice = currentPrice + change;
        
        projectData.stockSummary.currentPrice = newPrice;
        
        // Update display
        const currentPriceElement = document.getElementById('current-price');
        if (currentPriceElement) {
            currentPriceElement.textContent = formatCurrency(newPrice);
        }
        
        // Update charts if they exist
        if (charts.priceChart) {
            const lastIndex = charts.priceChart.data.datasets[0].data.length - 1;
            charts.priceChart.data.datasets[0].data[lastIndex] = newPrice;
            charts.priceChart.update('none');
        }
    }, 30000); // Update every 30 seconds
}

// Initialize dashboard
function initializeDashboard() {
    console.log('🚀 Initializing Tesla Stock Prediction Dashboard...');
    
    // Initialize navigation
    initializeNavigation();
    
    // Update metrics
    updateMetrics();
    
    // Create correlation matrix
    createCorrelationMatrix();
    
    // Initialize charts for the current section
    initializeChartsForSection(currentSection);
    
    // Add interactive effects
    addInteractiveEffects();
    
    // Start real-time updates simulation
    simulateRealTimeUpdates();
    
    console.log('✅ Dashboard initialized successfully!');
}

// CSS for correlation matrix
const correlationStyles = `
<style>
.correlation-header,
.correlation-row {
    display: grid;
    grid-template-columns: 100px repeat(6, 1fr);
    gap: 1px;
    margin-bottom: 1px;
}

.correlation-cell {
    padding: 0.5rem;
    background: var(--bg-tertiary);
    text-align: center;
    font-size: 0.8rem;
    border-radius: 4px;
}

.correlation-value {
    font-weight: 600;
    color: var(--text-primary);
}

.correlation-value.positive {
    background: rgba(0, 255, 136, 0.3);
}

.correlation-value.negative {
    background: rgba(255, 68, 68, 0.3);
}

@media (max-width: 768px) {
    .correlation-header,
    .correlation-row {
        grid-template-columns: 80px repeat(6, 1fr);
    }
    
    .correlation-cell {
        padding: 0.25rem;
        font-size: 0.7rem;
    }
}
</style>
`;

// Add correlation styles to head
document.head.insertAdjacentHTML('beforeend', correlationStyles);

// Event listeners
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Handle window resize for charts
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
});

// Export functions for potential external use
window.TeslaDashboard = {
    projectData,
    charts,
    initializeDashboard,
    createPriceChart,
    createVolumeChart,
    createSentimentChart,
    createModelComparisonChart,
    createPredictionChart,
    createForecastChart
};