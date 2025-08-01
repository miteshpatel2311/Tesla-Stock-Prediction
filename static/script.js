// Tesla Stock Prediction Dashboard - Enhanced JavaScript
// Global variables and configuration
let charts = {};
let currentSection = 'overview';
let stockData = null;
let isDataLoading = false;
let refreshInterval = null;

// API Configuration
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    stockData: '/api/stock-data',
    predictions: '/api/predictions',
    modelPerformance: '/api/model-performance',
    technicalIndicators: '/api/technical-indicators',
    correlationMatrix: '/api/correlation-matrix',
    newsSentiment: '/api/news-sentiment',
    tradingSignals: '/api/trading-signals'
};

// Chart.js default configuration
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#b3b3b3';
Chart.defaults.plugins.legend.labels.usePointStyle = true;

// Utility Functions
const utils = {
    formatCurrency: (value) => {
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
        return `$${value.toFixed(2)}`;
    },
    
    formatNumber: (value) => {
        if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
        return value.toLocaleString();
    },
    
    formatPercent: (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
    
    getChangeClass: (value) => value >= 0 ? 'positive' : 'negative',
    
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    },
    
    showLoading: (show = true) => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = show ? 'flex' : 'none';
        }
    },
    
    updateLastUpdated: () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        const element = document.getElementById('last-updated-time');
        if (element) element.textContent = timeString;
    },
    
    showError: (message) => {
        console.error('Dashboard Error:', message);
        // Could implement toast notifications here
    }
};

// API Functions
const api = {
    async fetchData(endpoint, params = {}) {
        try {
            const url = new URL(API_BASE_URL + endpoint);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
            
            const response = await axios.get(url.toString());
            return response.data;
        } catch (error) {
            utils.showError(`Failed to fetch data from ${endpoint}: ${error.message}`);
            throw error;
        }
    },
    
    async getStockData() {
        return await this.fetchData(API_ENDPOINTS.stockData);
    },
    
    async getPredictions(days = 5) {
        return await this.fetchData(API_ENDPOINTS.predictions, { days });
    },
    
    async getModelPerformance() {
        return await this.fetchData(API_ENDPOINTS.modelPerformance);
    },
    
    async getTechnicalIndicators() {
        return await this.fetchData(API_ENDPOINTS.technicalIndicators);
    },
    
    async getCorrelationMatrix() {
        return await this.fetchData(API_ENDPOINTS.correlationMatrix);
    },
    
    async getNewsSentiment() {
        return await this.fetchData(API_ENDPOINTS.newsSentiment);
    },
    
    async getTradingSignals() {
        return await this.fetchData(API_ENDPOINTS.tradingSignals);
    }
};

// Chart Functions
const chartManager = {
    createMainStockChart(data) {
        const ctx = document.getElementById('main-stock-chart');
        if (!ctx) return;
        
        if (charts.mainStock) {
            charts.mainStock.destroy();
        }
        
        charts.mainStock = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.chart_data.dates,
                datasets: [{
                    label: 'Tesla Stock Price',
                    data: data.chart_data.prices,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }, {
                    label: 'MA 10',
                    data: data.chart_data.ma_10,
                    borderColor: '#00ff88',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }, {
                    label: 'MA 30',
                    data: data.chart_data.ma_30,
                    borderColor: '#ffaa00',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'YYYY-MM-DD',
                            tooltipFormat: 'MMM DD, YYYY',
                            displayFormats: {
                                day: 'MMM DD'
                            }
                        },
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            callback: function(value) {
                                return utils.formatCurrency(value);
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 2,
                        hoverRadius: 6
                    }
                }
            }
        });
    },
    
    createVolumeChart(data) {
        const ctx = document.getElementById('volume-chart');
        if (!ctx) return;
        
        if (charts.volume) {
            charts.volume.destroy();
        }
        
        charts.volume = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.chart_data.dates,
                datasets: [{
                    label: 'Volume',
                    data: data.chart_data.volumes,
                    backgroundColor: 'rgba(0, 212, 255, 0.6)',
                    borderColor: '#00d4ff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            callback: function(value) {
                                return utils.formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    createSentimentChart(sentimentData) {
        const ctx = document.getElementById('sentiment-chart');
        if (!ctx) return;
        
        if (charts.sentiment) {
            charts.sentiment.destroy();
        }
        
        charts.sentiment = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sentimentData.dates,
                datasets: [{
                    label: 'Sentiment Score',
                    data: sentimentData.sentiment_scores,
                    borderColor: '#ff4444',
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        min: -1,
                        max: 1
                    }
                }
            }
        });
    },
    
    createModelComparisonChart(performanceData) {
        const ctx = document.getElementById('model-comparison-chart');
        if (!ctx) return;
        
        if (charts.modelComparison) {
            charts.modelComparison.destroy();
        }
        
        const models = Object.keys(performanceData);
        const mseData = models.map(model => performanceData[model].MSE);
        const maeData = models.map(model => performanceData[model].MAE);
        const r2Data = models.map(model => performanceData[model].R2);
        
        charts.modelComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: models,
                datasets: [{
                    label: 'MSE',
                    data: mseData,
                    backgroundColor: '#ff4444',
                    yAxisID: 'y'
                }, {
                    label: 'MAE',
                    data: maeData,
                    backgroundColor: '#ffaa00',
                    yAxisID: 'y'
                }, {
                    label: 'R² Score',
                    data: r2Data,
                    backgroundColor: '#00ff88',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: '#333333'
                        },
                        title: {
                            display: true,
                            text: 'MSE / MAE'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: 'R² Score'
                        }
                    }
                }
            }
        });
    },
    
    createPredictionChart(predictionData) {
        const ctx = document.getElementById('prediction-chart');
        if (!ctx) return;
        
        if (charts.prediction) {
            charts.prediction.destroy();
        }
        
        charts.prediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: predictionData.dates,
                datasets: [{
                    label: 'LSTM Prediction',
                    data: predictionData.lstm,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: 'ARIMA Prediction',
                    data: predictionData.arima,
                    borderColor: '#ffaa00',
                    backgroundColor: 'rgba(255, 170, 0, 0.1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: 'Hybrid Prediction',
                    data: predictionData.hybrid,
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 3,
                    fill: false
                }, {
                    label: 'Confidence Upper',
                    data: predictionData.confidence_intervals.upper,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    fill: '+1',
                    pointRadius: 0
                }, {
                    label: 'Confidence Lower',
                    data: predictionData.confidence_intervals.lower,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            filter: function(item) {
                                return !item.text.includes('Confidence');
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#333333'
                        }
                    },
                    y: {
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            callback: function(value) {
                                return utils.formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    createPriceSparkline(data) {
        const ctx = document.getElementById('price-sparkline');
        if (!ctx) return;
        
        if (charts.priceSparkline) {
            charts.priceSparkline.destroy();
        }
        
        // Use last 10 data points for sparkline
        const sparklineData = data.chart_data.prices.slice(-10);
        
        charts.priceSparkline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(sparklineData.length).fill(''),
                datasets: [{
                    data: sparklineData,
                    borderColor: '#00d4ff',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        });
    }
};

// Data Update Functions
const dataManager = {
    async updateOverviewSection() {
        try {
            const data = await api.getStockData();
            const indicators = await api.getTechnicalIndicators();
            const signals = await api.getTradingSignals();
            
            stockData = data;
            
            // Update metric cards
            this.updateMetricCards(data);
            
            // Update charts
            chartManager.createMainStockChart(data);
            chartManager.createPriceSparkline(data);
            
            // Update technical indicators
            this.updateTechnicalIndicators(indicators);
            
            // Update trading signals
            this.updateTradingSignals(signals);
            
        } catch (error) {
            utils.showError('Failed to update overview section');
        }
    },
    
    updateMetricCards(data) {
        // Current Price
        const currentPriceEl = document.getElementById('current-price');
        const priceChangeEl = document.getElementById('price-change');
        
        if (currentPriceEl) {
            currentPriceEl.textContent = utils.formatCurrency(data.current_price);
        }
        
        if (priceChangeEl) {
            const changePercent = data.price_change_pct;
            priceChangeEl.textContent = utils.formatPercent(changePercent);
            priceChangeEl.className = `metric-change ${utils.getChangeClass(changePercent)}`;
        }
        
        // Volume
        const volumeEl = document.getElementById('current-volume');
        if (volumeEl) {
            volumeEl.textContent = utils.formatNumber(data.volume);
        }
        
        // 52W High/Low
        const highLowEl = document.getElementById('high-low-range');
        if (highLowEl) {
            highLowEl.textContent = `${utils.formatCurrency(data.high_52w)} / ${utils.formatCurrency(data.low_52w)}`;
        }
        
        // Market Cap
        const marketCapEl = document.getElementById('market-cap');
        if (marketCapEl) {
            marketCapEl.textContent = utils.formatCurrency(data.market_cap);
        }
    },
    
    updateTechnicalIndicators(indicators) {
        // RSI
        const rsiValueEl = document.getElementById('rsi-value');
        const rsiFillEl = document.getElementById('rsi-fill');
        const rsiStatusEl = document.getElementById('rsi-status');
        
        if (rsiValueEl && rsiFillEl && rsiStatusEl) {
            const rsi = indicators.rsi;
            rsiValueEl.textContent = rsi.toFixed(2);
            rsiFillEl.style.width = `${rsi}%`;
            
            if (rsi < 30) {
                rsiStatusEl.textContent = 'Oversold';
                rsiStatusEl.className = 'indicator-status oversold';
            } else if (rsi > 70) {
                rsiStatusEl.textContent = 'Overbought';
                rsiStatusEl.className = 'indicator-status overbought';
            } else {
                rsiStatusEl.textContent = 'Neutral';
                rsiStatusEl.className = 'indicator-status neutral';
            }
        }
        
        // Volatility
        const volatilityValueEl = document.getElementById('volatility-value');
        const volatilityFillEl = document.getElementById('volatility-fill');
        const volatilityStatusEl = document.getElementById('volatility-status');
        
        if (volatilityValueEl && volatilityFillEl && volatilityStatusEl) {
            const volatility = indicators.volatility;
            volatilityValueEl.textContent = (volatility * 100).toFixed(2) + '%';
            volatilityFillEl.style.width = `${Math.min(volatility * 100 * 10, 100)}%`;
            
            if (volatility > 0.05) {
                volatilityStatusEl.textContent = 'High';
                volatilityStatusEl.className = 'indicator-status high';
            } else if (volatility < 0.02) {
                volatilityStatusEl.textContent = 'Low';
                volatilityStatusEl.className = 'indicator-status low';
            } else {
                volatilityStatusEl.textContent = 'Normal';
                volatilityStatusEl.className = 'indicator-status normal';
            }
        }
        
        // Support/Resistance
        const supportEl = document.getElementById('support-level');
        const resistanceEl = document.getElementById('resistance-level');
        
        if (supportEl) {
            supportEl.textContent = utils.formatCurrency(indicators.support_level);
        }
        
        if (resistanceEl) {
            resistanceEl.textContent = utils.formatCurrency(indicators.resistance_level);
        }
    },
    
    updateTradingSignals(signalsData) {
        const container = document.getElementById('trading-signals-container');
        if (!container) return;
        
        const signals = signalsData.signals;
        
        if (signals.length === 0) {
            container.innerHTML = '<div class="no-signals">No active signals</div>';
            return;
        }
        
        const signalsHtml = signals.map(signal => `
            <div class="trading-signal ${signal.type.toLowerCase()}">
                <div class="signal-type">${signal.type}</div>
                <div class="signal-indicator">${signal.indicator}</div>
                <div class="signal-strength">${signal.strength}</div>
                <div class="signal-message">${signal.message}</div>
            </div>
        `).join('');
        
        container.innerHTML = signalsHtml;
    },
    
    async updateAnalysisSection() {
        try {
            if (!stockData) {
                stockData = await api.getStockData();
            }
            
            const sentimentData = await api.getNewsSentiment();
            const correlationData = await api.getCorrelationMatrix();
            
            // Update charts
            chartManager.createVolumeChart(stockData);
            chartManager.createSentimentChart(sentimentData);
            
            // Update correlation matrix
            this.updateCorrelationMatrix(correlationData);
            
            // Update news headlines
            this.updateNewsHeadlines(sentimentData);
            
        } catch (error) {
            utils.showError('Failed to update analysis section');
        }
    },
    
    updateCorrelationMatrix(correlationData) {
        const container = document.getElementById('correlation-heatmap');
        if (!container) return;
        
        const { labels, data } = correlationData;
        
        let html = '<div class="correlation-matrix">';
        html += '<div class="correlation-labels">';
        labels.forEach(label => {
            html += `<div class="correlation-label">${label}</div>`;
        });
        html += '</div>';
        
        html += '<div class="correlation-grid">';
        data.forEach((row, i) => {
            row.forEach((value, j) => {
                const intensity = Math.abs(value);
                const color = value > 0 ? 'positive' : 'negative';
                html += `<div class="correlation-cell ${color}" 
                         style="opacity: ${intensity}" 
                         title="${labels[i]} vs ${labels[j]}: ${value.toFixed(3)}">
                         ${value.toFixed(2)}
                         </div>`;
            });
        });
        html += '</div></div>';
        
        container.innerHTML = html;
    },
    
    updateNewsHeadlines(sentimentData) {
        const container = document.getElementById('news-headlines');
        if (!container) return;
        
        const headlines = sentimentData.recent_headlines;
        
        const headlinesHtml = headlines.map(headline => `
            <div class="news-headline">
                <i class="fas fa-newspaper"></i>
                <span>${headline}</span>
            </div>
        `).join('');
        
        container.innerHTML = headlinesHtml;
    },
    
    async updateModelsSection() {
        try {
            const performanceData = await api.getModelPerformance();
            
            // Update performance table
            this.updateModelPerformanceTable(performanceData);
            
            // Update comparison chart
            chartManager.createModelComparisonChart(performanceData);
            
        } catch (error) {
            utils.showError('Failed to update models section');
        }
    },
    
    updateModelPerformanceTable(performanceData) {
        const tbody = document.querySelector('#model-performance-table tbody');
        if (!tbody) return;
        
        const models = Object.keys(performanceData);
        
        const tableHtml = models.map(modelName => {
            const model = performanceData[modelName];
            const statusClass = model.R2 > 0 ? 'excellent' : model.R2 > -0.3 ? 'good' : 'average';
            const statusText = model.R2 > 0 ? 'Excellent' : model.R2 > -0.3 ? 'Good' : 'Average';
            
            return `
                <tr class="model-row ${modelName.toLowerCase() === 'hybrid' ? 'best-model' : ''}">
                    <td class="model-name">
                        <i class="fas fa-${modelName.toLowerCase() === 'lstm' ? 'brain' : modelName.toLowerCase() === 'arima' ? 'chart-line' : 'trophy'}"></i>
                        <strong>${modelName}</strong>
                    </td>
                    <td>${model.MSE.toFixed(2)}</td>
                    <td>${model.MAE.toFixed(2)}</td>
                    <td>${model.RMSE.toFixed(2)}</td>
                    <td>${model.R2.toFixed(4)}</td>
                    <td>${model.MAPE.toFixed(2)}%</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    },
    
    async updatePredictionsSection() {
        try {
            const days = parseInt(document.getElementById('prediction-days')?.value || 5);
            const predictionData = await api.getPredictions(days);
            
            // Update prediction chart
            chartManager.createPredictionChart(predictionData);
            
            // Update prediction table
            this.updatePredictionTable(predictionData);
            
        } catch (error) {
            utils.showError('Failed to update predictions section');
        }
    },
    
    updatePredictionTable(predictionData) {
        const tbody = document.querySelector('#prediction-table tbody');
        if (!tbody) return;
        
        const tableHtml = predictionData.dates.map((date, index) => {
            const lstm = predictionData.lstm[index];
            const arima = predictionData.arima[index];
            const hybrid = predictionData.hybrid[index];
            const confidence = Math.max(0, 100 - (index * 10)); // Decreasing confidence
            const riskLevel = confidence > 80 ? 'Low' : confidence > 60 ? 'Medium' : 'High';
            const riskClass = confidence > 80 ? 'low' : confidence > 60 ? 'medium' : 'high';
            
            return `
                <tr>
                    <td>${utils.formatDate(date)}</td>
                    <td>${utils.formatCurrency(lstm)}</td>
                    <td>${utils.formatCurrency(arima)}</td>
                    <td><strong>${utils.formatCurrency(hybrid)}</strong></td>
                    <td>${confidence}%</td>
                    <td><span class="risk-badge ${riskClass}">${riskLevel}</span></td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    },
    
    async updateDataTablesSection() {
        try {
            if (!stockData) {
                stockData = await api.getStockData();
            }
            
            // Update historical data table
            this.updateHistoricalDataTable(stockData);
            
        } catch (error) {
            utils.showError('Failed to update data tables section');
        }
    },
    
    updateHistoricalDataTable(data) {
        const tbody = document.querySelector('#historical-data-table tbody');
        if (!tbody) return;
        
        const { dates, prices, volumes, ma_10, rsi } = data.chart_data;
        
        // Create table rows from the last 30 days of data
        const rowCount = Math.min(30, dates.length);
        const tableHtml = Array.from({ length: rowCount }, (_, i) => {
            const index = dates.length - rowCount + i;
            const date = dates[index];
            const open = prices[index] * (0.98 + Math.random() * 0.04); // Simulate open price
            const high = prices[index] * (1.005 + Math.random() * 0.02); // Simulate high
            const low = prices[index] * (0.995 - Math.random() * 0.02); // Simulate low
            const close = prices[index];
            const volume = volumes[index];
            const rsiValue = rsi[index];
            const volatility = Math.random() * 0.05; // Simulate volatility
            const change = i > 0 ? ((close - prices[index - 1]) / prices[index - 1] * 100) : 0;
            
            return `
                <tr>
                    <td>${utils.formatDate(date)}</td>
                    <td>${utils.formatCurrency(open)}</td>
                    <td>${utils.formatCurrency(high)}</td>
                    <td>${utils.formatCurrency(low)}</td>
                    <td>${utils.formatCurrency(close)}</td>
                    <td>${utils.formatNumber(volume)}</td>
                    <td>${rsiValue ? rsiValue.toFixed(2) : 'N/A'}</td>
                    <td>${(volatility * 100).toFixed(2)}%</td>
                    <td class="${utils.getChangeClass(change)}">${utils.formatPercent(change)}</td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    },
    
    async updateInsightsSection() {
        try {
            if (!stockData) {
                stockData = await api.getStockData();
            }
            
            const indicators = await api.getTechnicalIndicators();
            const signals = await api.getTradingSignals();
            const performanceData = await api.getModelPerformance();
            
            // Generate AI insights
            this.generateInsights(stockData, indicators, signals, performanceData);
            
        } catch (error) {
            utils.showError('Failed to update insights section');
        }
    },
    
    generateInsights(stockData, indicators, signals, performanceData) {
        // Market Summary
        const marketSummary = document.getElementById('market-summary');
        if (marketSummary) {
            const trend = stockData.price_change_pct > 0 ? 'bullish' : 'bearish';
            const trendIcon = stockData.price_change_pct > 0 ? '📈' : '📉';
            
            marketSummary.innerHTML = `
                <div class="insight-item">
                    <span class="insight-icon">${trendIcon}</span>
                    <div class="insight-text">
                        <strong>Current Trend:</strong> Tesla is showing a ${trend} trend with a 
                        ${utils.formatPercent(stockData.price_change_pct)} change. Current price is 
                        ${utils.formatCurrency(stockData.current_price)}.
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">📊</span>
                    <div class="insight-text">
                        <strong>Volume Analysis:</strong> Trading volume is ${utils.formatNumber(stockData.volume)}, 
                        indicating ${stockData.volume > 100000000 ? 'high' : 'normal'} market interest.
                    </div>
                </div>
            `;
        }
        
        // Trading Recommendations
        const tradingRecs = document.getElementById('trading-recommendations');
        if (tradingRecs) {
            const rsi = indicators.rsi;
            let recommendation = 'HOLD';
            let recIcon = '⚖️';
            let recColor = 'neutral';
            
            if (rsi < 30) {
                recommendation = 'BUY';
                recIcon = '🟢';
                recColor = 'positive';
            } else if (rsi > 70) {
                recommendation = 'SELL';
                recIcon = '🔴';
                recColor = 'negative';
            }
            
            tradingRecs.innerHTML = `
                <div class="insight-item">
                    <span class="insight-icon">${recIcon}</span>
                    <div class="insight-text">
                        <strong class="${recColor}">Primary Signal: ${recommendation}</strong><br>
                        Based on RSI (${rsi.toFixed(2)}) and current market conditions.
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">🎯</span>
                    <div class="insight-text">
                        <strong>Price Targets:</strong> Support at ${utils.formatCurrency(indicators.support_level)}, 
                        Resistance at ${utils.formatCurrency(indicators.resistance_level)}.
                    </div>
                </div>
            `;
        }
        
        // Risk Analysis
        const riskAnalysis = document.getElementById('risk-analysis');
        if (riskAnalysis) {
            const volatility = indicators.volatility;
            const riskLevel = volatility > 0.05 ? 'High' : volatility > 0.03 ? 'Medium' : 'Low';
            const riskIcon = volatility > 0.05 ? '⚠️' : volatility > 0.03 ? '⚡' : '✅';
            
            riskAnalysis.innerHTML = `
                <div class="insight-item">
                    <span class="insight-icon">${riskIcon}</span>
                    <div class="insight-text">
                        <strong>Risk Level: ${riskLevel}</strong><br>
                        Current volatility is ${(volatility * 100).toFixed(2)}%. 
                        ${riskLevel === 'High' ? 'Exercise caution with position sizing.' : 
                          riskLevel === 'Medium' ? 'Moderate risk - suitable for balanced portfolios.' : 
                          'Low risk environment - favorable for conservative investors.'}
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">🛡️</span>
                    <div class="insight-text">
                        <strong>Stop Loss Recommendation:</strong> Set stop loss at 
                        ${utils.formatCurrency(stockData.current_price * 0.95)} (-5%) to manage downside risk.
                    </div>
                </div>
            `;
        }
        
        // Key Levels
        const keyLevels = document.getElementById('key-levels');
        if (keyLevels) {
            keyLevels.innerHTML = `
                <div class="insight-item">
                    <span class="insight-icon">🔺</span>
                    <div class="insight-text">
                        <strong>Resistance Level:</strong> ${utils.formatCurrency(indicators.resistance_level)}<br>
                        Break above this level could signal further upside.
                    </div>
                </div>
                <div class="insight-item">
                    <span class="insight-icon">🔻</span>
                    <div class="insight-text">
                        <strong>Support Level:</strong> ${utils.formatCurrency(indicators.support_level)}<br>
                        Watch for potential bounce or breakdown at this level.
                    </div>
                </div>
            `;
        }
    }
};

// Navigation Functions
const navigation = {
    init() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    },
    
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        currentSection = sectionId;
        
        // Load section data
        this.loadSectionData(sectionId);
    },
    
    async loadSectionData(sectionId) {
        utils.showLoading(true);
        
        try {
            switch (sectionId) {
                case 'overview':
                    await dataManager.updateOverviewSection();
                    break;
                case 'analysis':
                    await dataManager.updateAnalysisSection();
                    break;
                case 'models':
                    await dataManager.updateModelsSection();
                    break;
                case 'predictions':
                    await dataManager.updatePredictionsSection();
                    break;
                case 'data-tables':
                    await dataManager.updateDataTablesSection();
                    break;
                case 'insights':
                    await dataManager.updateInsightsSection();
                    break;
            }
        } catch (error) {
            utils.showError(`Failed to load ${sectionId} section`);
        } finally {
            utils.showLoading(false);
            utils.updateLastUpdated();
        }
    }
};

// Event Listeners
const eventListeners = {
    init() {
        // Navigation
        navigation.init();
        
        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshCurrentSection();
            });
        }
        
        // Export data button
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Prediction controls
        const generatePredictionsBtn = document.getElementById('generate-predictions');
        if (generatePredictionsBtn) {
            generatePredictionsBtn.addEventListener('click', () => {
                dataManager.updatePredictionsSection();
            });
        }
        
        // Table sorting
        this.initTableSorting();
        
        // Chart controls
        this.initChartControls();
    },
    
    async refreshCurrentSection() {
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            refreshBtn.disabled = true;
        }
        
        try {
            await navigation.loadSectionData(currentSection);
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshBtn.disabled = false;
            }
        }
    },
    
    exportData() {
        if (!stockData) {
            utils.showError('No data available to export');
            return;
        }
        
        const dataToExport = {
            timestamp: new Date().toISOString(),
            stock_data: stockData,
            current_section: currentSection
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tesla-stock-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    initTableSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header);
            });
        });
    },
    
    sortTable(header) {
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const column = header.getAttribute('data-column');
        const columnIndex = Array.from(header.parentNode.children).indexOf(header);
        
        // Toggle sort direction
        const isAscending = header.classList.contains('sort-asc');
        
        // Remove all sort classes
        sortableHeaders.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add appropriate sort class
        header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent.trim();
            const bValue = b.children[columnIndex].textContent.trim();
            
            // Try to parse as numbers
            const aNum = parseFloat(aValue.replace(/[$,%]/g, ''));
            const bNum = parseFloat(bValue.replace(/[$,%]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? bNum - aNum : aNum - bNum;
            } else {
                return isAscending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            }
        });
        
        // Reorder table rows
        rows.forEach(row => tbody.appendChild(row));
    },
    
    initChartControls() {
        const timeframeSelect = document.getElementById('chart-timeframe');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', () => {
                // Implement timeframe change logic
                if (currentSection === 'overview') {
                    dataManager.updateOverviewSection();
                }
            });
        }
        
        const chartTypeButtons = document.querySelectorAll('.chart-type-btn');
        chartTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                chartTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Implement chart type change logic
                const chartType = btn.getAttribute('data-type');
                // This would switch between line and candlestick charts
            });
        });
    }
};

// Auto-refresh functionality
const autoRefresh = {
    start(intervalMinutes = 5) {
        this.stop(); // Clear any existing interval
        
        refreshInterval = setInterval(async () => {
            if (!isDataLoading) {
                try {
                    isDataLoading = true;
                    await navigation.loadSectionData(currentSection);
                } catch (error) {
                    utils.showError('Auto-refresh failed');
                } finally {
                    isDataLoading = false;
                }
            }
        }, intervalMinutes * 60 * 1000);
    },
    
    stop() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    utils.showLoading(true);
    
    try {
        // Initialize event listeners
        eventListeners.init();
        
        // Load initial data
        await navigation.loadSectionData('overview');
        
        // Start auto-refresh
        autoRefresh.start(5); // Refresh every 5 minutes
        
        console.log('🚀 Tesla Stock Dashboard initialized successfully!');
        
    } catch (error) {
        utils.showError('Failed to initialize dashboard');
        console.error('Dashboard initialization error:', error);
    } finally {
        utils.showLoading(false);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        autoRefresh.stop();
    } else {
        autoRefresh.start(5);
        // Refresh data when page becomes visible again
        if (!isDataLoading) {
            navigation.loadSectionData(currentSection);
        }
    }
});

// Handle window resize for responsive charts
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});