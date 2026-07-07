/* script.js - Frontend Logic and Interactive Chart/Table Rendering */

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const analyzeForm = document.getElementById('analyzeForm');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoader = analyzeBtn.querySelector('.btn-loader');
    
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');
    const toggleArrow = settingsToggle.querySelector('.toggle-arrow');
    
    const thresholdInput = document.getElementById('thresholdInput');
    const thresholdVal = document.getElementById('thresholdVal');
    const includePageInput = document.getElementById('includePageInput');
    const modelDefaultThreshold = document.getElementById('modelDefaultThreshold');
    
    const resultsPanel = document.getElementById('resultsPanel');
    const placeholderState = document.getElementById('placeholderState');
    const loadingState = document.getElementById('loadingState');
    const loadingMsg = document.getElementById('loadingMsg');
    const resultContent = document.getElementById('resultContent');
    
    const verdictCard = document.getElementById('verdictCard');
    const verdictIcon = document.getElementById('verdictIcon');
    const verdictTitle = document.getElementById('verdictTitle');
    const verdictDesc = document.getElementById('verdictDesc');
    
    const gaugeFill = document.getElementById('gaugeFill');
    const gaugePercentageVal = document.getElementById('gaugePercentageVal');
    
    const hlHttps = document.getElementById('hlHttps');
    const hlHttpsVal = document.getElementById('hlHttpsVal');
    const hlEntropy = document.getElementById('hlEntropy');
    const hlEntropyVal = document.getElementById('hlEntropyVal');
    const hlLength = document.getElementById('hlLength');
    const hlLengthVal = document.getElementById('hlLengthVal');
    const hlTld = document.getElementById('hlTld');
    const hlTldVal = document.getElementById('hlTldVal');
    
    const pageTabBtn = document.getElementById('pageTabBtn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    const urlFeaturesTableBody = document.getElementById('urlFeaturesTableBody');
    const pageFeaturesTableBody = document.getElementById('pageFeaturesTableBody');
    const modelTypeBadge = document.getElementById('modelTypeBadge');

    // --- DICTIONARIES: FRIENDLY FEATURE LABELS AND THRESHOLDS ---
    const urlFeatureMeta = {
        "url_length": { name: "Độ dài URL", desc: "Độ dài ký tự toàn bộ chuỗi URL. URL quá dài thường dùng để ẩn mã độc." },
        "path_length": { name: "Độ dài đường dẫn (path)", desc: "Số lượng ký tự trong phần path của URL." },
        "query_length": { name: "Độ dài truy vấn (query)", desc: "Số lượng ký tự trong chuỗi tham số sau dấu hỏi chấm (?)." },
        "num_params": { name: "Số tham số URL", desc: "Số lượng các tham số truyền lên web (tách biệt bởi dấu &)." },
        "has_https": { name: "Chứng chỉ bảo mật HTTPS", desc: "1 = Có mã hóa SSL/HTTPS bảo mật; 0 = Giao thức HTTP không mã hóa." },
        "domain_length": { name: "Độ dài tên miền", desc: "Độ dài ký tự của domain chính." },
        "subdomain_depth": { name: "Số cấp tên miền phụ", desc: "Số lượng nhãn phân cách bởi dấu chấm trước domain chính (ví dụ: login.sub.example.com)." },
        "tld_suspicious": { name: "Đuôi TLD đáng ngờ", desc: "Tên miền sử dụng TLD rẻ hoặc hay dùng phát tán mã độc (.cfd, .xyz, .cc, .top...)" },
        "num_digits": { name: "Ký tự số trong URL", desc: "Tổng số lượng chữ số (0-9) xuất hiện trên URL." },
        "num_special": { name: "Ký tự đặc biệt", desc: "Tổng số lượng ký tự đặc biệt (- , _ , @ , ? , = , . , ...)" },
        "num_url_encoded": { name: "Ký tự mã hóa URL", desc: "Số lần ký tự được mã hóa dưới dạng %xx (ví dụ: %20, %2F)." },
        "entropy": { name: "Độ Entropy tên miền", desc: "Mức độ hỗn loạn thông tin tên miền. Entropy cao nghĩa là tên miền được sinh ngẫu nhiên (DGA)." },
        "path_depth": { name: "Độ sâu đường dẫn", desc: "Số lượng thư mục con biểu thị bằng dấu gạch chéo (/) trong đường dẫn." },
        "is_ip_address": { name: "Sử dụng địa chỉ IP", desc: "1 = URL dùng địa chỉ IP (ví dụ: 192.168.1.1) thay vì tên miền chữ." }
    };

    const pageFeatureMeta = {
        "fetch_success": { name: "Tải trang thành công", desc: "Cho biết hệ thống có thể kết nối và tải mã nguồn HTML của trang hay không." },
        "redirect_count": { name: "Số lần chuyển hướng", desc: "Số lần trang chuyển hướng trước khi dừng lại ở trang cuối cùng." },
        "domain_changed": { name: "Chuyển đổi tên miền", desc: "1 = URL chuyển hướng sang tên miền hoàn toàn khác (đặc trưng phishing); 0 = Cùng tên miền." },
        "has_password_input": { name: "Trường nhập mật khẩu", desc: "Có chứa thẻ <input type='password'> để người dùng nhập thông tin đăng nhập." },
        "has_login_form": { name: "Form nhập tài khoản", desc: "Trang web chứa form thu thập tài khoản/mật khẩu." },
        "external_form_action": { name: "Form gửi ra ngoài", desc: "Dữ liệu đăng nhập gửi đến một domain lạ ngoài tên miền trang hiện tại." },
        "external_link_ratio": { name: "Tỷ lệ link liên kết ngoài", desc: "Tỷ số giữa các liên kết trỏ ra website khác trên tổng số liên kết." },
        "hidden_iframe_count": { name: "Số iframe ẩn", desc: "Số lượng thẻ nhúng iframe bị ẩn đi nhằm thực thi mã độc ngầm." },
        "script_count": { name: "Số lượng mã JavaScript", desc: "Số lượng thẻ <script> hoạt động trên trang." },
        "meta_refresh": { name: "Tự động tải lại trang", desc: "Trang web sử dụng meta refresh để ép buộc chuyển hướng tự động." },
        "title_domain_match": { name: "Tên miền khớp tiêu đề", desc: "Tiêu đề trang chứa tên miền. Phishing thường không khớp vì giả thương hiệu." },
        "favicon_external": { name: "Favicon từ bên ngoài", desc: "Biểu tượng trang web (favicon) tải từ domain của một thương hiệu nổi tiếng khác." },
        "copyright_mismatch": { name: "Mâu thuẫn bản quyền", desc: "Footer bản quyền đề cập tên thương hiệu nổi tiếng nhưng tên miền lại khác." }
    };

    // --- ACCORDION TOGGLE ---
    settingsToggle.addEventListener('click', () => {
        settingsContent.classList.toggle('hidden');
        toggleArrow.classList.toggle('rotate');
    });

    // --- UPDATE SLIDER DISPLAY ---
    thresholdInput.addEventListener('input', (e) => {
        thresholdVal.textContent = parseFloat(e.target.value).toFixed(2);
    });

    // --- HANDLE QUICK EXAMPLES ---
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const url = tag.getAttribute('data-url');
            urlInput.value = url;
            
            // Set configuration based on safe/danger click
            if (tag.classList.contains('tag-danger')) {
                includePageInput.checked = false; // standard test
            } else {
                includePageInput.checked = false;
            }
            
            // Auto submit
            analyzeForm.dispatchEvent(new Event('submit'));
        });
    });

    // --- TABS CONTROL ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('disabled')) return;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- FORM SUBMISSION & BACKEND COMMUNICATION ---
    analyzeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlValue = urlInput.value.trim();
        if (!urlValue) return;

        // Show loading state
        placeholderState.classList.add('hidden');
        resultContent.classList.add('hidden');
        loadingState.classList.remove('hidden');
        
        // Adjust loading msg based on setting
        const withPageFetch = includePageInput.checked;
        if (withPageFetch) {
            loadingMsg.textContent = "Đang kết nối & tải nội dung trang HTML (Mất 3-8 giây)...";
        } else {
            loadingMsg.textContent = "Đang phân tích cấu trúc cú pháp URL...";
        }

        // Disable submit buttons
        analyzeBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: urlValue,
                    threshold: parseFloat(thresholdInput.value),
                    include_page: withPageFetch
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Có lỗi xảy ra trên server!");
            }

            const data = await response.json();
            renderResults(data);
            
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
            placeholderState.classList.remove('hidden');
            loadingState.classList.add('hidden');
        } finally {
            // Re-enable submit buttons
            analyzeBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    });

    // --- RENDER API RESULTS TO UI ---
    function renderResults(data) {
        // Hide loading, show results panel
        loadingState.classList.add('hidden');
        resultContent.classList.remove('hidden');

        const prob = data.probability;
        const threshold = data.threshold;
        const isMalicious = data.is_malicious;
        const features = data.features;

        // 1. Update Model Badge and Default Threshold values
        modelTypeBadge.innerHTML = `<i class="fa-solid fa-brain"></i> ${data.meta.model_type.toUpperCase()} F1-Score ~${(data.meta.best_cv_f1 * 100).toFixed(1)}%`;
        modelDefaultThreshold.textContent = threshold.toFixed(3);

        // 2. Verdict Card styling & texts
        verdictCard.className = "verdict-card"; // Reset
        if (isMalicious) {
            verdictCard.classList.add('verdict-malicious');
            verdictIcon.className = "fa-solid fa-circle-exclamation";
            verdictTitle.textContent = "ĐỘC HẠI / GIẢ MẠO";
            verdictDesc.textContent = `Hệ thống xác định URL này chứa dấu hiệu lừa đảo hoặc độc hại với xác suất vượt ngưỡng an toàn (${(prob*100).toFixed(2)}% >= ${(threshold*100).toFixed(0)}%).`;
        } else {
            verdictCard.classList.add('verdict-safe');
            verdictIcon.className = "fa-solid fa-circle-check";
            verdictTitle.textContent = "AN TOÀN / ĐÁNG TIN CẬY";
            verdictDesc.textContent = `URL nằm dưới ngưỡng cảnh báo an toàn. Tuy nhiên, vẫn nên cẩn thận khi giao dịch chuyển tiền mặt hoặc nhập thông tin nhạy cảm.`;
        }

        // 3. Score Gauge animation
        const percentage = Math.round(prob * 100);
        gaugePercentageVal.textContent = `${percentage}%`;
        
        // Gauge stroke-dasharray = 251.2 (for r=40: 2 * PI * 40 = 251.2)
        const offset = 251.2 * (1 - prob);
        gaugeFill.style.strokeDashoffset = offset;
        
        // Gauge color mapping
        if (prob >= threshold) {
            gaugeFill.style.stroke = "var(--danger)";
            gaugeFill.style.filter = "drop-shadow(0 0 4px var(--danger-glow))";
        } else if (prob > 0.4) {
            gaugeFill.style.stroke = "var(--warning)";
            gaugeFill.style.filter = "none";
        } else {
            gaugeFill.style.stroke = "var(--success)";
            gaugeFill.style.filter = "drop-shadow(0 0 4px var(--success-glow))";
        }

        // 4. Update Quick Highlights
        // - HTTPS status
        const hasHttps = features["has_https"] === 1;
        hlHttpsVal.textContent = hasHttps ? "Có HTTPS" : "Không HTTPS";
        hlHttps.className = "highlight-item " + (hasHttps ? "hl-trigger-safe" : "hl-trigger-danger");
        hlHttps.querySelector('.hl-icon i').className = hasHttps ? "fa-solid fa-lock" : "fa-solid fa-lock-open";

        // - Domain Entropy
        const entropy = features["entropy"] || 0;
        hlEntropyVal.textContent = entropy.toFixed(2);
        const isEntropySuspicious = entropy > 4.2;
        hlEntropy.className = "highlight-item " + (isEntropySuspicious ? "hl-trigger-danger" : "hl-trigger-safe");

        // - URL Length
        const urlLen = features["url_length"] || 0;
        hlLengthVal.textContent = `${urlLen} ký tự`;
        const isLengthSuspicious = urlLen > 110;
        hlLength.className = "highlight-item " + (isLengthSuspicious ? "hl-trigger-danger" : "hl-trigger-safe");

        // - TLD suspicious status
        const isTldSuspicious = features["tld_suspicious"] === 1;
        hlTldVal.textContent = isTldSuspicious ? "Đáng Ngờ" : "Thông Thường";
        hlTld.className = "highlight-item " + (isTldSuspicious ? "hl-trigger-danger" : "hl-trigger-safe");

        // 5. Populate Tables
        urlFeaturesTableBody.innerHTML = "";
        pageFeaturesTableBody.innerHTML = "";

        // Build URL features
        Object.keys(urlFeatureMeta).forEach(key => {
            if (key in features) {
                const val = features[key];
                const meta = urlFeatureMeta[key];
                const tr = document.createElement('tr');
                
                // Determine alert status pill
                let statusHtml = '<span class="status-pill safe">Bình thường</span>';
                if (key === 'has_https' && val === 0) {
                    statusHtml = '<span class="status-pill danger">Nguy hiểm (Không mã hóa)</span>';
                } else if (key === 'tld_suspicious' && val === 1) {
                    statusHtml = '<span class="status-pill danger">Đáng ngờ</span>';
                } else if (key === 'is_ip_address' && val === 1) {
                    statusHtml = '<span class="status-pill danger">Nguy hiểm</span>';
                } else if (key === 'entropy' && val > 4.2) {
                    statusHtml = '<span class="status-pill warn">Nhìn giống DGA</span>';
                } else if (key === 'url_length' && val > 110) {
                    statusHtml = '<span class="status-pill warn">Quá dài</span>';
                } else if (key === 'subdomain_depth' && val > 3) {
                    statusHtml = '<span class="status-pill warn">Subdomain sâu</span>';
                }

                tr.innerHTML = `
                    <td class="feat-code">${key}</td>
                    <td class="feat-val">${val}</td>
                    <td class="feat-desc"><strong>${meta.name}</strong>: ${meta.desc}</td>
                    <td>${statusHtml}</td>
                `;
                urlFeaturesTableBody.appendChild(tr);
            }
        });

        // Handle HTML page-content features tab if checked
        if (data.include_page) {
            pageTabBtn.classList.remove('disabled');
            
            Object.keys(pageFeatureMeta).forEach(key => {
                if (key in features) {
                    const val = features[key];
                    const meta = pageFeatureMeta[key];
                    const tr = document.createElement('tr');
                    
                    // Determine alert status
                    let statusHtml = '<span class="status-pill safe">An toàn / Bình thường</span>';
                    
                    // Specific highlight rule triggers
                    if (key === 'fetch_success' && val === 0) {
                        statusHtml = '<span class="status-pill warn">Không thể kết nối</span>';
                    } else if (key === 'domain_changed' && val === 1) {
                        statusHtml = '<span class="status-pill danger">Nguy hiểm (Chuyển hướng lạ)</span>';
                    } else if (key === 'external_form_action' && val === 1) {
                        statusHtml = '<span class="status-pill danger">Nguy hiểm (Gửi tài khoản ra ngoài)</span>';
                    } else if (key === 'copyright_mismatch' && val === 1) {
                        statusHtml = '<span class="status-pill danger">Mâu thuẫn thông tin thương hiệu</span>';
                    } else if (key === 'hidden_iframe_count' && val > 0) {
                        statusHtml = '<span class="status-pill danger">Đáng ngờ (Nhúng ẩn)</span>';
                    } else if (key === 'has_password_input' && val === 1) {
                        statusHtml = '<span class="status-pill warn">Có trường điền tài khoản</span>';
                    } else if (key === 'external_link_ratio' && val > 0.6) {
                        statusHtml = '<span class="status-pill warn">Trang trống / Nhiều link ngoài</span>';
                    }

                    tr.innerHTML = `
                        <td class="feat-code">${key}</td>
                        <td class="feat-val">${typeof val === 'number' ? val.toFixed(4).replace(/\.0000$/, '') : val}</td>
                        <td class="feat-desc"><strong>${meta.name}</strong>: ${meta.desc}</td>
                        <td>${statusHtml}</td>
                    `;
                    pageFeaturesTableBody.appendChild(tr);
                }
            });
        } else {
            // Disable page features tab
            pageTabBtn.classList.add('disabled');
            
            // Switch to urlTab if pageTab was active
            if (pageTabBtn.classList.contains('active')) {
                document.querySelector('.tab-btn[data-tab="urlTab"]').click();
            }
        }
    }
});
