// components/include.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the current page path to determine relative path to root
    const currentPath = window.location.pathname;
    const inSubfolder = currentPath.includes('/viz/') || currentPath.includes('/StanTheMan/');
    const pathPrefix = inSubfolder ? '../' : '';
    
    // Load header
    fetch(`${pathPrefix}components/header.html`)
        .then(response => response.text())
        .then(data => {
            // Replace relative paths based on current location
            if (inSubfolder) {
                // Already has correct paths for subfolders
                document.body.insertAdjacentHTML('afterbegin', data);
            } else {
                // For root level, adjust paths
                const adjustedData = data
                    .replace(/href="\.\.\/tennis_analytics\.css"/g, 'href="tennis_analytics.css"')
                    .replace(/href="\.\.\/image\/favicon\.ico"/g, 'href="image/favicon.ico"')
                    .replace(/href="\.\.\/index\.html/g, 'href="index.html');
                document.body.insertAdjacentHTML('afterbegin', adjustedData);
            }
            
            // Highlight current page in navigation
            setTimeout(() => {
                const navLinks = document.querySelectorAll('.nav-links a');
                const currentPage = window.location.pathname.split('/').pop();
                
                navLinks.forEach(link => {
                    const linkPage = link.getAttribute('href').split('/').pop();
                    if (linkPage === currentPage || 
                        (currentPage === 'index.html' && link.classList.contains('home-link'))) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        });
    
    // Load footer
    fetch(`${pathPrefix}components/footer.html`)
        .then(response => response.text())
        .then(data => {
            // Replace relative paths based on current location
            if (inSubfolder) {
                // Already has correct paths for subfolders
                document.body.insertAdjacentHTML('beforeend', data);
            } else {
                // For root level, adjust paths
                const adjustedData = data
                    .replace(/href="\.\.\/index\.html/g, 'href="index.html')
                    .replace(/src="\.\.\/image\/tennis-animation\.js"/g, 'src="image/tennis-animation.js"');
                document.body.insertAdjacentHTML('beforeend', adjustedData);
            }
        });
});