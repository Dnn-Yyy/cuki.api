document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    const loadingDotsAnimation = setInterval(() => {
        const loadingDots = document.querySelector(".loading-dots");
        if (loadingDots) {
            if (loadingDots.textContent === '...') {
                loadingDots.textContent = '.';
            } else {
                loadingDots.textContent += '.';
            }
        }
    }, 500);

    const sideNav = document.querySelector('.side-nav');
    const mainWrapper = document.querySelector('.main-wrapper');
    const navCollapseBtn = document.querySelector('.nav-collapse-btn');
    const menuToggle = document.querySelector('.menu-toggle');

    navCollapseBtn.addEventListener('click', () => {
        sideNav.classList.toggle('collapsed');
        mainWrapper.classList.toggle('nav-collapsed');
    });

    menuToggle.addEventListener('click', () => {
        sideNav.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && 
            !e.target.closest('.side-nav') && 
            !e.target.closest('.menu-toggle') && 
            sideNav.classList.contains('active')) {
            sideNav.classList.remove('active');
        }
    });

    document.querySelectorAll('.side-nav-link').forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth' 
                    });

                    document.querySelectorAll('.side-nav-link').forEach(l => {
                        l.classList.remove('active');
                    });
                    this.classList.add('active');

                    if (window.innerWidth < 992) {
                        sideNav.classList.remove('active');
                    }
                }
            });
        }
    });

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;

        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.side-nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    const showToast = (message, type = 'info') => {
        const toast = document.getElementById('notificationToast');
        const toastBody = toast.querySelector('.toast-body');
        const toastTitle = toast.querySelector('.toast-title');
        const toastIcon = toast.querySelector('.toast-icon');

        toastBody.textContent = message;

        toast.style.borderLeftColor = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';

        toastIcon.className = `toast-icon fas fa-${
            type === 'success' 
                ? 'check-circle' 
                : type === 'error' 
                    ? 'exclamation-circle' 
                    : 'info-circle'
        } me-2`;

        toastIcon.style.color = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';

        toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    const themeToggle = document.getElementById('themeToggle');

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        showToast(`Switched to ${isDarkMode ? 'dark' : 'light'} mode`, 'success');
    });

    document.getElementById('clearSearch').addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.length > 0) {
            searchInput.value = '';
            searchInput.focus();
            searchInput.dispatchEvent(new Event('input'));
            searchInput.classList.add('shake-animation');
            setTimeout(() => {
                searchInput.classList.remove('shake-animation');
            }, 400);
        }
    });

    const copyToClipboard = (elementId) => {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        navigator.clipboard.writeText(text).then(() => {
            const btn = elementId === 'apiEndpoint' ? 
                document.getElementById('copyEndpoint') : 
                document.getElementById('copyResponse');

            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.classList.add('copy-success');

            showToast('Copied to clipboard successfully!', 'success');

            setTimeout(() => {
                btn.innerHTML = '<i class="far fa-copy"></i>';
                btn.classList.remove('copy-success');
            }, 1500);
        }).catch(err => {
            showToast('Failed to copy text: ' + err, 'error');
        });
    };

    document.getElementById('copyEndpoint').addEventListener('click', () => {
        copyToClipboard('apiEndpoint');
    });

    document.getElementById('copyResponse').addEventListener('click', () => {
        copyToClipboard('apiResponseContent');
    });

    try {
        const response = await fetch('/openapi.json');
        if (!response.ok) {
            throw new Error(`Failed to load openapi.json: ${response.status} ${response.statusText}`);
        }

        const openApiData = await response.json();
        const routes = openApiData.routes || [];

        const setContent = (id, property, value, fallback = '') => {
            const element = document.getElementById(id);
            if (element) element[property] = value || fallback;
        };

        const currentYear = new Date().getFullYear();
        const creator = openApiData.creator || 'API';
        setContent('page', 'textContent', creator, "API");
        setContent('wm', 'textContent', `© ${currentYear} ${creator}. All rights reserved.`);
        setContent('header', 'textContent', creator, "API");
        setContent('name', 'textContent', creator, "API");
        setContent('sideNavName', 'textContent', creator || "API");
        setContent('version', 'textContent', 'v1.0', "v1.0");
        setContent('versionHeader', 'textContent', 'Active!', "Active!");
        setContent('description', 'textContent', 'API Documentation', "API Documentation");

        const dynamicImage = document.getElementById('dynamicImage');
        if (dynamicImage) {
            dynamicImage.src = '/src/banner.jpg';
            dynamicImage.onerror = () => {
                dynamicImage.src = '/api/src/banner.jpg';
                showToast('Failed to load banner image, using default', 'error');
            };
            dynamicImage.onload = () => {
                dynamicImage.classList.add('fade-in');
            };
        }

        const apiLinksContainer = document.getElementById('apiLinks');
        if (apiLinksContainer) {
            apiLinksContainer.innerHTML = '';
            const githubLink = document.createElement('a');
            githubLink.href = 'https://github.com/FlowFalcon';
            githubLink.target = '_blank';
            githubLink.className = 'api-link';
            githubLink.innerHTML = '<i class="fab fa-github"></i> GitHub';
            apiLinksContainer.appendChild(githubLink);
        }

        const apiContent = document.getElementById('apiContent');

        if (!routes.length) {
            apiContent.innerHTML = `
                <div class="no-results-message">
                    <i class="fas fa-database"></i>
                    <p>No API routes found</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            `;
        } else {
            const categories = {};
            routes.forEach(route => {
                const category = route.category || 'Uncategorized';
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(route);
            });

            Object.keys(categories).forEach((categoryName, catIndex) => {
                const sortedItems = categories[categoryName].sort((a, b) => a.path.localeCompare(b.path));

                const categoryElement = document.createElement('div');
                categoryElement.className = 'category-section';
                categoryElement.style.animationDelay = `${catIndex * 0.2}s`;

                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'category-header';
                categoryHeader.textContent = categoryName;
                categoryElement.appendChild(categoryHeader);

                const itemsRow = document.createElement('div');
                itemsRow.className = 'row';

                sortedItems.forEach((item, index) => {
                    const itemCol = document.createElement('div');
                    itemCol.className = 'col-md-6 col-lg-4 api-item';
                    itemCol.dataset.name = item.path;
                    itemCol.dataset.desc = item.description || '';
                    itemCol.dataset.category = categoryName;
                    itemCol.style.animationDelay = `${index * 0.05 + 0.3}s`;

                    const heroSection = document.createElement('div');
                    heroSection.className = 'hero-section';

                    const infoDiv = document.createElement('div');

                    const itemTitle = document.createElement('h5');
                    itemTitle.className = 'mb-0';
                    itemTitle.textContent = `${item.method} ${item.path}`;

                    const itemDesc = document.createElement('p');
                    itemDesc.className = 'text-muted mb-0';
                    itemDesc.textContent = item.description || '';

                    infoDiv.appendChild(itemTitle);
                    infoDiv.appendChild(itemDesc);

                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'api-actions';

                    const getBtn = document.createElement('button');
                    getBtn.className = 'btn get-api-btn';
                    getBtn.innerHTML = '<i class="fas fa-code"></i> GET';
                    getBtn.dataset.apiPath = item.path;
                    getBtn.dataset.apiMethod = item.method;
                    getBtn.dataset.apiName = `${item.method} ${item.path}`;
                    getBtn.dataset.apiDesc = item.description || '';
                    getBtn.setAttribute('aria-label', `Get ${item.method} ${item.path}`);

                    const statusIndicator = document.createElement('div');
                    statusIndicator.className = 'api-status status-ready';
                    statusIndicator.setAttribute('title', 'API is ready');
                    statusIndicator.setAttribute('data-bs-toggle', 'tooltip');
                    statusIndicator.setAttribute('data-bs-placement', 'left');

                    const icon = document.createElement('i');
                    icon.className = 'fas fa-circle';
                    statusIndicator.appendChild(icon);

                    const statusText = document.createElement('span');
                    statusText.textContent = 'ready';
                    statusIndicator.appendChild(statusText);

                    actionsDiv.appendChild(getBtn);
                    actionsDiv.appendChild(statusIndicator);

                    heroSection.appendChild(infoDiv);
                    heroSection.appendChild(actionsDiv);

                    itemCol.appendChild(heroSection);
                    itemsRow.appendChild(itemCol);
                });

                categoryElement.appendChild(itemsRow);
                apiContent.appendChild(categoryElement);
            });
        }

        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');

        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('search-focused');
        });

        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('search-focused');
        });

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();

            if (searchTerm.length > 0) {
                clearSearchBtn.style.opacity = '1';
                clearSearchBtn.style.pointerEvents = 'auto';
            } else {
                clearSearchBtn.style.opacity = '0';
                clearSearchBtn.style.pointerEvents = 'none';
            }

            const apiItems = document.querySelectorAll('.api-item');
            const categoryHeaders = document.querySelectorAll('.category-header');
            const categoryImages = document.querySelectorAll('.category-image');
            const categoryCount = {};

            apiItems.forEach(item => {
                const name = item.getAttribute('data-name').toLowerCase();
                const desc = item.getAttribute('data-desc').toLowerCase();
                const category = item.getAttribute('data-category').toLowerCase();

                const matchesSearch = name.includes(searchTerm) || 
                                     desc.includes(searchTerm) || 
                                     category.includes(searchTerm);

                if (matchesSearch) {
                    item.style.display = '';
                    if (searchTerm !== '') {
                        item.classList.add('search-match');
                        setTimeout(() => item.classList.remove('search-match'), 800);
                    }

                    if (!categoryCount[category]) {
                        categoryCount[category] = 0;
                    }
                    categoryCount[category]++;
                } else {
                    item.style.display = 'none';
                }
            });

            categoryHeaders.forEach((header, index) => {
                const categorySection = header.closest('.category-section');
                const categoryRow = categorySection.querySelector('.row');
                const categoryName = header.textContent.toLowerCase();

                if (categoryCount[categoryName] > 0) {
                    categorySection.style.display = '';
                    if (categoryImages[index]) {
                        categoryImages[index].style.display = '';
                    }

                    if (searchTerm.length > 0) {
                        let countBadge = header.querySelector('.count-badge');
                        if (!countBadge) {
                            countBadge = document.createElement('span');
                            countBadge.className = 'count-badge';
                            countBadge.style.fontSize = '14px';
                            countBadge.style.marginLeft = '10px';
                            countBadge.style.fontWeight = 'normal';
                            countBadge.style.color = 'var(--text-muted)';
                            header.appendChild(countBadge);
                        }
                        countBadge.textContent = `(${categoryCount[categoryName]} results)`;
                    } else {
                        const countBadge = header.querySelector('.count-badge');
                        if (countBadge) {
                            header.removeChild(countBadge);
                        }
                    }
                } else {
                    categorySection.style.display = 'none';
                    if (categoryImages[index]) {
                        categoryImages[index].style.display = 'none';
                    }
                }
            });

            let noResultsMsg = document.getElementById('noResultsMessage');

            const noVisibleSections = Array.from(document.querySelectorAll('.category-section')).every(
                section => section.style.display === 'none'
            );

            if (noVisibleSections && searchTerm.length > 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.id = 'noResultsMessage';
                    noResultsMsg.className = 'no-results-message fade-in';
                    noResultsMsg.innerHTML = `
                        <i class="fas fa-search"></i>
                        <p>No results found for "<span>${searchTerm}</span>"</p>
                        <button id="clearSearchFromMsg" class="btn btn-primary">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                    `;
                    apiContent.appendChild(noResultsMsg);

                    document.getElementById('clearSearchFromMsg').addEventListener('click', () => {
                        searchInput.value = '';
                        searchInput.dispatchEvent(new Event('input'));
                        searchInput.focus();
                    });
                } else {
                    noResultsMsg.querySelector('span').textContent = searchTerm;
                    noResultsMsg.style.display = 'flex';
                }
            } else if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        });

        document.addEventListener('click', event => {
            const getApiBtn = event.target.closest('.get-api-btn');
            if (!getApiBtn) return;

            getApiBtn.classList.add('pulse-animation');
            setTimeout(() => {
                getApiBtn.classList.remove('pulse-animation');
            }, 300);

            const { apiPath, apiMethod, apiName, apiDesc } = getApiBtn.dataset;
            const modal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
            const modalRefs = {
                label: document.getElementById('apiResponseModalLabel'),
                desc: document.getElementById('apiResponseModalDesc'),
                content: document.getElementById('apiResponseContent'),
                container: document.getElementById('responseContainer'),
                endpoint: document.getElementById('apiEndpoint'),
                spinner: document.getElementById('apiResponseLoading'),
                queryInputContainer: document.getElementById('apiQueryInputContainer'),
                submitBtn: document.getElementById('submitQueryBtn')
            };

            modalRefs.label.textContent = apiName;
            modalRefs.desc.textContent = apiDesc;
            modalRefs.content.textContent = '';
            modalRefs.endpoint.textContent = '';
            modalRefs.spinner.classList.add('d-none');
            modalRefs.content.classList.add('d-none');
            modalRefs.container.classList.add('d-none');
            modalRefs.endpoint.classList.add('d-none');

            modalRefs.queryInputContainer.innerHTML = '';
            modalRefs.submitBtn.classList.add('d-none');
            modalRefs.submitBtn.disabled = true;
            modalRefs.submitBtn.classList.remove('btn-active');

            const currentRoute = routes.find(route => route.path === apiPath && route.method.toLowerCase() === apiMethod.toLowerCase());
            const parameters = currentRoute?.parameters || [];
            const hasParams = parameters.length > 0;

            if (hasParams) {
                const paramContainer = document.createElement('div');
                paramContainer.className = 'param-container';

                const formTitle = document.createElement('h6');
                formTitle.className = 'param-form-title';
                formTitle.innerHTML = '<i class="fas fa-sliders-h"></i> Parameters';
                paramContainer.appendChild(formTitle);

                parameters.forEach((param, index) => {
                    const isRequired = param.required !== false;
                    const paramGroup = document.createElement('div');
                    paramGroup.className = index < parameters.length - 1 ? 'mb-3 param-group' : 'param-group';

                    const labelContainer = document.createElement('div');
                    labelContainer.className = 'param-label-container';

                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = param.name;
                    label.htmlFor = `param-${param.name}`;

                    if (isRequired) {
                        const requiredSpan = document.createElement('span');
                        requiredSpan.className = 'required-indicator';
                        requiredSpan.textContent = '*';
                        label.appendChild(requiredSpan);
                    }

                    labelContainer.appendChild(label);

                    if (param.description) {
                        const tooltipIcon = document.createElement('i');
                        tooltipIcon.className = 'fas fa-info-circle param-info';
                        tooltipIcon.setAttribute('data-bs-toggle', 'tooltip');
                        tooltipIcon.setAttribute('data-bs-placement', 'top');
                        tooltipIcon.title = param.description;
                        labelContainer.appendChild(tooltipIcon);
                    }

                    paramGroup.appendChild(labelContainer);

                    const inputContainer = document.createElement('div');
                    inputContainer.className = 'input-container';

                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'form-control custom-input';
                    inputField.id = `param-${param.name}`;
                    inputField.placeholder = `Enter ${param.name}...`;
                    inputField.dataset.param = param.name;
                    if (isRequired) {
                        inputField.required = true;
                    }
                    inputField.autocomplete = "off";

                    inputField.addEventListener('focus', () => {
                        inputContainer.classList.add('input-focused');
                    });

                    inputField.addEventListener('blur', () => {
                        inputContainer.classList.remove('input-focused');
                        if (isRequired && !inputField.value.trim()) {
                            inputField.classList.add('is-invalid');
                        } else {
                            inputField.classList.remove('is-invalid');
                        }
                    });

                    inputField.addEventListener('input', validateInputs);

                    inputContainer.appendChild(inputField);
                    paramGroup.appendChild(inputContainer);
                    paramContainer.appendChild(paramGroup);
                });

                if (currentRoute?.description) {
                    const innerDescDiv = document.createElement('div');
                    innerDescDiv.className = 'inner-desc';
                    innerDescDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${currentRoute.description.replace(/\n/g, '<br>')}`;
                    paramContainer.appendChild(innerDescDiv);
                }

                modalRefs.queryInputContainer.appendChild(paramContainer);
                modalRefs.submitBtn.classList.remove('d-none');

                modalRefs.submitBtn.onclick = async () => {
                    const inputs = modalRefs.queryInputContainer.querySelectorAll('input');
                    const newParams = new URLSearchParams();
                    let isValid = true;

                    inputs.forEach(input => {
                        const isRequired = input.required;
                        if (isRequired && !input.value.trim()) {
                            isValid = false;
                            input.classList.add('is-invalid');
                            input.parentElement.classList.add('shake-animation');
                            setTimeout(() => {
                                input.parentElement.classList.remove('shake-animation');
                            }, 500);
                        } else {
                            input.classList.remove('is-invalid');
                            if (input.value.trim()) {
                                newParams.append(input.dataset.param, input.value.trim());
                            }
                        }
                    });

                    if (!isValid) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'alert alert-danger mt-3 fade-in';
                        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all required fields.';

                        const existingError = modalRefs.queryInputContainer.querySelector('.alert');
                        if (existingError) existingError.remove();

                        modalRefs.queryInputContainer.appendChild(errorMsg);

                        modalRefs.submitBtn.classList.add('shake-animation');
                        setTimeout(() => {
                            modalRefs.submitBtn.classList.remove('shake-animation');
                        }, 500);

                        return;
                    }

                    modalRefs.submitBtn.disabled = true;
                    modalRefs.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

                    const basePath = apiPath.split('?')[0];
                    let apiUrlWithParams = `${window.location.origin}${basePath}`;
                    const queryString = newParams.toString();
                    if (queryString) {
                        apiUrlWithParams += `?${queryString}`;
                    }

                    modalRefs.queryInputContainer.style.opacity = '0';
                    setTimeout(() => {
                        modalRefs.queryInputContainer.innerHTML = '';
                        modalRefs.queryInputContainer.style.opacity = '1';
                        modalRefs.submitBtn.classList.add('d-none');
                        handleApiRequest(apiUrlWithParams, modalRefs, apiName);
                    }, 300);
                };

                const tooltips = modalRefs.queryInputContainer.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            } else {
                const baseUrl = `${window.location.origin}${apiPath}`;
                handleApiRequest(baseUrl, modalRefs, apiName);
            }

            modal.show();
        });

        function validateInputs() {
            const submitBtn = document.getElementById('submitQueryBtn');
            const inputs = document.querySelectorAll('.param-container input');
            const requiredInputs = Array.from(inputs).filter(input => input.required);
            const isValid = requiredInputs.every(input => input.value.trim() !== '');

            if (isValid) {
                submitBtn.disabled = false;
                submitBtn.classList.add('btn-active');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.remove('btn-active');
            }

            this.classList.remove('is-invalid');

            const errorMsg = document.querySelector('.alert.alert-danger');
            if (errorMsg && this.value.trim() !== '') {
                errorMsg.classList.add('fade-out');
                setTimeout(() => errorMsg.remove(), 300);
            }
        }

        async function handleApiRequest(apiUrl, modalRefs, apiName) {
            modalRefs.spinner.classList.remove('d-none');
            modalRefs.container.classList.add('d-none');

            modalRefs.endpoint.textContent = '';
            modalRefs.endpoint.classList.remove('d-none');

            const typingSpeed = 20;
            const endpointText = apiUrl;
            let charIndex = 0;

            const typeEndpoint = () => {
                if (charIndex < endpointText.length) {
                    modalRefs.endpoint.textContent += endpointText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeEndpoint, typingSpeed);
                }
            };

            typeEndpoint();

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch(apiUrl, { 
                    signal: controller.signal 
                }).catch(error => {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timed out. Please try again.');
                    }
                    throw error;
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText || 'Unknown error'}`);
                }

                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('image/')) {
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = apiName;
                    img.className = 'response-image fade-in';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = 'var(--border-radius)';
                    img.style.boxShadow = 'var(--shadow)';
                    img.style.transition = 'var(--transition)';

                    img.onmouseover = () => {
                        img.style.transform = 'scale(1.02)';
                        img.style.boxShadow = 'var(--hover-shadow)';
                    };

                    img.onmouseout = () => {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = 'var(--shadow)';
                    };

                    modalRefs.content.innerHTML = '';
                    modalRefs.content.appendChild(img);

                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'btn btn-primary mt-3';
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Image';
                    downloadBtn.style.width = '100%';

                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `${apiName.toLowerCase().replace(/\s+/g, '-')}.${blob.type.split('/')[1]}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showToast('Image download started!', 'success');
                    };

                    modalRefs.content.appendChild(downloadBtn);
                } else {
                    const data = await response.json();
                    const formattedJson = syntaxHighlight(JSON.stringify(data, null, 2));
                    modalRefs.content.innerHTML = formattedJson;

                    if (JSON.stringify(data, null, 2).split('\n').length > 15) {
                        addCodeFolding(modalRefs.content);
                    }
                }

                modalRefs.container.classList.remove('d-none');
                modalRefs.content.classList.remove('d-none');
                modalRefs.container.classList.add('slide-in-bottom');
                showToast(`Successfully retrieved ${apiName}`, 'success');
            } catch (error) {
                const errorContainer = document.createElement('div');
                errorContainer.className = 'error-container fade-in';

                const errorIcon = document.createElement('div');
                errorIcon.className = 'error-icon';
                errorIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';

                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.innerHTML = `
                    <h6>Error Occurred</h6>
                    <p>${error.message}</p>
                    <div class="mt-2">
                        <button class="btn btn-sm retry-btn">
                            <i class="fas fa-sync-alt"></i> Retry Request
                        </button>
                    </div>
                `;

                errorContainer.appendChild(errorIcon);
                errorContainer.appendChild(errorMessage);

                modalRefs.content.innerHTML = '';
                modalRefs.content.appendChild(errorContainer);
                modalRefs.container.classList.remove('d-none');
                modalRefs.content.classList.remove('d-none');

                errorContainer.querySelector('.retry-btn').addEventListener('click', () => {
                    modalRefs.content.classList.add('d-none');
                    modalRefs.container.classList.add('d-none');
                    handleApiRequest(apiUrl, modalRefs, apiName);
                });

                showToast('Error retrieving data. Check response for details.', 'error');
            } finally {
                modalRefs.spinner.classList.add('d-none');
            }
        }

        function addCodeFolding(container) {
            const codeLines = container.innerHTML.split('\n');
            let foldableContent = '';
            let inObject = false;
            let objectLevel = 0;
            let foldedLineCount = 0;

            for (let i = 0; i < codeLines.length; i++) {
                const line = codeLines[i];

                if (line.includes('{') && !line.includes('}')) {
                    if (!inObject) {
                        foldableContent += `<div class="code-fold-trigger" data-folded="false">${line}</div>`;
                        foldableContent += '<div class="code-fold-content">';
                        inObject = true;
                        objectLevel = 1;
                    } else {
                        foldableContent += line + '\n';
                        objectLevel++;
                    }
                } else if (line.includes('}') && !line.includes('{')) {
                    objectLevel--;
                    if (objectLevel === 0 && inObject) {
                        foldableContent += line + '\n';
                        foldableContent += '</div>';
                        inObject = false;
                    } else {
                        foldableContent += line + '\n';
                    }
                } else {
                    if (inObject) {
                        foldableContent += line + '\n';
                        foldedLineCount++;
                    } else {
                        foldableContent += line + '\n';
                    }
                }
            }

            container.innerHTML = foldableContent;

            const foldTriggers = container.querySelectorAll('.code-fold-trigger');
            foldTriggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const isFolded = trigger.getAttribute('data-folded') === 'true';
                    const content = trigger.nextElementSibling;

                    if (isFolded) {
                        content.style.maxHeight = '0';
                        content.style.display = 'block';
                        setTimeout(() => {
                            content.style.maxHeight = content.scrollHeight + 'px';
                            trigger.setAttribute('data-folded', 'false');
                            trigger.classList.remove('folded');
                        }, 10);

                        setTimeout(() => {
                            content.style.maxHeight = '';
                        }, 300);
                    } else {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        setTimeout(() => {
                            content.style.maxHeight = '0';
                        }, 10);

                        setTimeout(() => {
                            content.style.display = 'none';
                            trigger.setAttribute('data-folded', 'true');
                            trigger.classList.add('folded');
                        }, 300);
                    }
                });

                if (trigger.nextElementSibling.classList.contains('code-fold-content')) {
                    const lineCount = trigger.nextElementSibling.innerHTML.split('\n').length - 1;
                    const foldIndicator = document.createElement('span');
                    foldIndicator.className = 'fold-indicator';
                    foldIndicator.innerHTML = `<i class="fas fa-chevron-down"></i> ${lineCount} lines`;
                    trigger.appendChild(foldIndicator);
                }
            });
        }

        function syntaxHighlight(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }

        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });

        const notificationBell = document.querySelector('.notification-bell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                showToast('2 new updates available', 'info');
            });
        }

    } catch (error) {
        console.error('Error loading openapi.json:', error);
        showToast(`Failed to load openapi.json: ${error.message}`, 'error');
    } finally {
        clearInterval(loadingDotsAnimation);
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');

            setTimeout(() => {
                loadingScreen.style.display = "none";
                body.classList.remove("no-scroll");
            }, 500);
        }, 1000);
    }

    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.api-item:not(.in-view)').forEach(item => {
            observer.observe(item);
        });
    };

    observeElements();
    window.addEventListener('resize', observeElements);
});