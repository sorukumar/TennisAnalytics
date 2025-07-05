class SocialShare extends HTMLElement {
    constructor() {
        super();
        this.pageUrl = encodeURIComponent(window.location.href);
        this.shareTitle = this.getShareTitle();
        this.shareDescription = this.getShareDescription();
    }

    getShareTitle() {
        // Try to get title from Twitter meta tag first, then Open Graph, then fallback to document title
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        
        if (twitterTitle && twitterTitle.content) {
            return encodeURIComponent(twitterTitle.content);
        } else if (ogTitle && ogTitle.content) {
            return encodeURIComponent(ogTitle.content);
        } else {
            return encodeURIComponent(document.title);
        }
    }

    getShareDescription() {
        // Try to get description from Twitter meta tag first, then Open Graph
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        
        if (twitterDesc && twitterDesc.content) {
            return encodeURIComponent(twitterDesc.content);
        } else if (ogDesc && ogDesc.content) {
            return encodeURIComponent(ogDesc.content);
        } else {
            return '';
        }
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="social-share-fab">
                <button class="fab-trigger" aria-label="Share this page">
                    <i class="fas fa-share-alt"></i>
                </button>
                <div class="fab-options">
                    <button class="share-btn twitter" aria-label="Share on X (Twitter)">
                        <i class="fab fa-twitter"></i>
                    </button>
                    <button class="share-btn linkedin" aria-label="Share on LinkedIn">
                        <i class="fab fa-linkedin"></i>
                    </button>
                    <button class="share-btn facebook" aria-label="Share on Facebook">
                        <i class="fab fa-facebook"></i>
                    </button>
                    <button class="share-btn reddit" aria-label="Share on Reddit">
                        <i class="fab fa-reddit"></i>
                    </button>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const fabTrigger = this.querySelector('.fab-trigger');
        const fabOptions = this.querySelector('.fab-options');
        
        fabTrigger.addEventListener('click', () => {
            fabOptions.classList.toggle('show');
        });

        // Close fab options when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contains(e.target)) {
                fabOptions.classList.remove('show');
            }
        });

        // Add click handlers for all share buttons
        this.querySelector('.twitter').addEventListener('click', () => {
            const tweetText = this.shareDescription ? `${decodeURIComponent(this.shareTitle)} - ${decodeURIComponent(this.shareDescription)}` : decodeURIComponent(this.shareTitle);
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${this.pageUrl}`, '_blank', 'width=550,height=420');
        });
        
        this.querySelector('.linkedin').addEventListener('click', () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${this.pageUrl}`, '_blank', 'width=550,height=420');
        });

        this.querySelector('.facebook').addEventListener('click', () => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${this.pageUrl}`, '_blank', 'width=550,height=420');
        });

        this.querySelector('.reddit').addEventListener('click', () => {
            window.open(`https://www.reddit.com/submit?url=${this.pageUrl}&title=${this.shareTitle}`, '_blank', 'width=550,height=420');
        });
    }
}

customElements.define('social-share', SocialShare);