// Get all the navigation links
const navLinks = document.querySelectorAll('.nav-link');
const markdownContent = document.getElementById('markdown-content');

// 加载 Markdown 文件内容并显示
function loadMarkdown(file) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            // 使用 marked 解析 Markdown
            markdownContent.innerHTML = marked.parse(text, { sanitize: true });
        })
        .catch(error => {
            console.error('Error loading markdown file:', error);
            markdownContent.innerHTML = '<p>Error loading content.</p>';
        });
}

// Add click event listener to each link
navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        // Remove the active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        // Add the active class to the clicked link
        this.classList.add('active');
        // Get the chapter file name
        const chapterFile = this.getAttribute('data-chapter');
        // Load the corresponding Markdown file
        loadMarkdown(chapterFile);
    });
});

// Load the first chapter by default
document.querySelector('.nav-link').click();
