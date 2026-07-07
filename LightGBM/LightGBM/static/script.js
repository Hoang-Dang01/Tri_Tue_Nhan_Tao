/* script.js - Simple URL Analyzer UI Logic */

document.addEventListener('DOMContentLoaded', () => {
    const analyzeForm = document.getElementById('analyzeForm');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    
    const inputSection = document.querySelector('.input-section');
    const resultsSection = document.getElementById('resultsSection');
    const errorSection = document.getElementById('errorSection');
    const clearBtn = document.getElementById('clearBtn');
    
    // Example links
    document.querySelectorAll('.example-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            urlInput.value = link.getAttribute('data-url');
            analyzeForm.dispatchEvent(new Event('submit'));
        });
    });
    
    // Handle form submission
    analyzeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlValue = urlInput.value.trim();
        if (!urlValue) return;
        
        // Show loading
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        analyzeBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: urlValue,
                    threshold: 0.5,
                    include_page: false
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Lỗi từ server');
            }
            
            const data = await response.json();
            displayResults(data);
            
        } catch (error) {
            showError(error.message);
        } finally {
            analyzeBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });
    
    // Display analysis results
    function displayResults(data) {
        const prob = data.probability;
        const isMalicious = data.is_malicious;
        const features = data.features;
        
        // Build verdict card
        const verdictClass = isMalicious ? 'danger' : 'safe';
        const verdictTitle = isMalicious ? '⚠️ PHISHING/ĐỘC HẠI' : '✅ AN TOÀN';
        const verdictDesc = isMalicious 
            ? `URL này có khả năng là phishing với xác suất ${(prob * 100).toFixed(1)}%`
            : `URL này trông an toàn (xác suất độc hại ${(prob * 100).toFixed(1)}%)`;
        
        const verdictHTML = `
            <div class="result-verdict ${verdictClass}">
                <h2>${verdictTitle}</h2>
                <p>${verdictDesc}</p>
                <div class="result-risk-bar">
                    <div class="result-risk-fill" style="width: ${prob * 100}%"></div>
                </div>
            </div>
        `;
        
        document.getElementById('resultVerdict').innerHTML = verdictHTML;
        
        // Build features table
        const featureRows = Object.entries(features)
            .filter(([key]) => key !== 'url')
            .map(([key, value]) => {
                const displayValue = typeof value === 'number' ? value.toFixed(3) : value;
                return `
                    <tr>
                        <td><strong>${key}</strong></td>
                        <td>${displayValue}</td>
                        <td>-</td>
                    </tr>
                `;
            })
            .join('');
        
        document.getElementById('featuresBody').innerHTML = featureRows;
        
        // Show results
        resultsSection.classList.remove('hidden');
        errorSection.classList.add('hidden');
    }
    
    // Show error
    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        errorSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }
    
    // Clear and restart
    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        urlInput.focus();
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        analyzeForm.reset();
    });
});
