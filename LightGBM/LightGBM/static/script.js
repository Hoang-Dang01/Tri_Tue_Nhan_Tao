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
        const featureDescriptions = {
            "url_length": "Độ dài toàn bộ URL. URL độc hại/phishing thường có độ dài lớn để chèn các ký tự gây nhiễu.",
            "path_length": "Độ dài phần đường dẫn (path) của URL.",
            "query_length": "Độ dài chuỗi tham số (query string) của URL.",
            "num_params": "Số lượng tham số truyền trên URL.",
            "has_https": "Giao thức HTTPS bảo mật (1: Có, 0: Không dùng HTTPS).",
            "domain_length": "Độ dài của tên miền (domain). Tên miền quá dài thường đáng nghi.",
            "subdomain_depth": "Số lượng tên miền phụ (subdomain). Tên miền phụ lồng nhiều cấp (ví dụ: login.paypal.com.abc.com) là dấu hiệu phishing.",
            "tld_suspicious": "Tên miền cấp cao nhất (TLD) đáng ngờ (1: Đuôi tên miền lạ/rẻ tiền hay dùng cho phishing, 0: Bình thường).",
            "num_digits": "Số lượng ký số trong URL. URL độc hại thường chứa nhiều số ngẫu nhiên.",
            "num_special": "Số lượng ký tự đặc biệt (-, _, @, ., ?, =).",
            "num_url_encoded": "Số ký tự bị mã hóa URL (ví dụ: %20, %2f). Kẻ tấn công thường dùng để ẩn giấu ký tự thực.",
            "entropy": "Độ hỗn loạn thông tin (entropy) của tên miền. Độ hỗn loạn cao thể hiện tên miền sinh ngẫu nhiên (DGA).",
            "path_depth": "Độ sâu thư mục (số lượng dấu gạch chéo '/' trong đường dẫn).",
            "is_ip_address": "Sử dụng địa chỉ IP trực tiếp thay vì tên miền (1: Đúng, 0: Sai). URL sạch hầu như không bao giờ dùng IP trực tiếp.",
            "fetch_success": "Tải nội dung trang web thành công (1: Thành công, 0: Thất bại).",
            "redirect_count": "Số lượng chuyển hướng (redirect) khi truy cập URL.",
            "domain_changed": "Tên miền bị thay đổi sau khi chuyển hướng (1: Có, 0: Không).",
            "has_password_input": "Trang web có ô nhập mật khẩu (1: Có, 0: Không).",
            "has_login_form": "Trang web có form đăng nhập (1: Có, 0: Không).",
            "external_form_action": "Form đăng nhập gửi dữ liệu sang tên miền khác (1: Đúng - Rất nguy hiểm, 0: Sai).",
            "external_link_ratio": "Tỷ lệ liên kết dẫn ra ngoài tên miền chính.",
            "hidden_iframe_count": "Số lượng khung ẩn (iframe có display:none hoặc ẩn). Thường dùng để nhúng mã độc ngầm.",
            "script_count": "Số lượng thẻ script (<script>) trong trang.",
            "meta_refresh": "Sử dụng thẻ meta refresh để tự động chuyển hướng trang (1: Có, 0: Không).",
            "title_domain_match": "Tiêu đề trang web chứa tên miền (1: Có, 0: Không).",
            "favicon_external": "Favicon được tải từ tên miền khác (1: Có, 0: Không).",
            "copyright_mismatch": "Tên bản quyền ở chân trang không khớp với tên miền (1: Có - Nghi ngờ mạo danh thương hiệu, 0: Khớp)."
        };

        const featureRows = Object.entries(features)
            .filter(([key]) => key !== 'url')
            .map(([key, value]) => {
                const displayValue = typeof value === 'number' ? value.toFixed(3) : value;
                const note = featureDescriptions[key] || '-';
                return `
                    <tr>
                        <td><strong>${key}</strong></td>
                        <td>${displayValue}</td>
                        <td>${note}</td>
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
