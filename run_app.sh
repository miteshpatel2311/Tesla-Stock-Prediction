#!/bin/bash

# Tesla Stock Prediction Dashboard - Streamlit Runner
echo "🚗⚡ Starting Tesla Stock Prediction Dashboard..."
echo "=============================================="

# Add local bin to PATH
export PATH=$PATH:/home/ubuntu/.local/bin

# Check if streamlit is available
if ! command -v streamlit &> /dev/null; then
    echo "❌ Streamlit is not installed. Installing dependencies..."
    pip install --break-system-packages streamlit pandas numpy yfinance plotly
fi

# Run the Streamlit app
echo "🚀 Launching dashboard on http://localhost:8501"
echo "📊 Loading real-time Tesla stock data..."
echo "🔄 Press Ctrl+C to stop the server"
echo "=============================================="

streamlit run app.py --server.headless true --server.port 8501 --server.address 0.0.0.0