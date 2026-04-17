document.addEventListener('DOMContentLoaded', function() {
    const loadComponent = (selector, url, callback) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                }
                if (callback) {
                    callback();
                }
            })
            .catch(error => console.error(`Error loading component:`, error));
    };

    // Load header and then initialize header-dependent scripts
    loadComponent('#header-placeholder', 'components/header.html', () => {
        const header = document.querySelector('.main-header .container');
        const navLinksContainer = document.querySelector('.nav-links');

        if (header && navLinksContainer) {
            const hamburger = document.createElement('div');
            hamburger.classList.add('hamburger');
            hamburger.innerHTML = `<span></span><span></span><span></span>`;
            header.appendChild(hamburger);

            hamburger.addEventListener('click', () => {
                navLinksContainer.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Initialize theme toggle
        const themeIcon = document.getElementById('theme-icon');
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
        themeIcon.className = currentTheme === 'dark' ? 'bx bx-sun theme-icon' : 'bx bx-moon theme-icon';

        themeIcon.addEventListener('click', () => {
            let theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeIcon.className = theme === 'dark' ? 'bx bx-sun theme-icon' : 'bx bx-moon theme-icon';
        });
    });

    // Load other components
    loadComponent('#footer-placeholder', 'components/footer.html');
    loadComponent('.team-section-container', 'components/team-section.html');

    // Smooth scrolling for anchor links
    document.body.addEventListener('click', function(e) {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            document.querySelector(e.target.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });

    // Simple scroll animation for sections
    const options = {
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    const initializePage = () => {
        // Re-run observer for all section-padding elements currently on the page
        document.querySelectorAll('.section-padding').forEach(section => {
            observer.observe(section);
        });

        // If a team section container exists, load the component
        if (document.querySelector('.team-section-container')) {
            loadComponent('.team-section-container', 'components/team-section.html', () => {
                // After the team section is loaded, make sure the observer is attached to it
                const newTeamSection = document.querySelector('.team-section-container .section-padding');
                if (newTeamSection) {
                    observer.observe(newTeamSection);
                }
            });
        }
        
        // Initialize testimonial slider if it exists
        if (document.querySelector('.testimonial-slider')) {
            new Swiper('.testimonial-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                    }
                }
            });
        }
    };

    // We need to wait a moment for components to load before observing on initial page load
    setTimeout(initializePage, 200);

    const handleNavigation = (url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch page: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newMain = doc.querySelector('main');
                if (newMain) {
                    document.querySelector('main').innerHTML = newMain.innerHTML;
                    window.scrollTo(0, 0); // Reset scroll position to the top
                    initializePage(); // Re-initialize observers and components for the new page
                }
            })
            .catch(error => console.error('Failed to load page:', error));
    };

    document.body.addEventListener('click', e => {
        // Correctly handle navigation for both nav links and the logo
        const link = e.target.closest('a');
        
        if (link && (link.closest('.nav-links') || link.classList.contains('logo'))) {
            // Check if it's an internal link
            if (link.hostname === window.location.hostname) {
                e.preventDefault();
                const url = link.getAttribute('href');
                
                // Only navigate if it's a new page
                if (url && url !== window.location.pathname) {
                    handleNavigation(url);
                }

                // Update active link styling
                document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                
                // Find the correct link to activate
                const targetUrl = url.split('/').pop();
                const activeLink = document.querySelector(`.nav-links a[href="${targetUrl}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        }
    });
});