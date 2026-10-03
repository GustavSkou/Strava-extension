 const feeds = document.querySelectorAll("web-feed-entry");

  feeds.forEach((feed) => {
    const ownerLink = divs[0]?.querySelector('[data-testid="owners-name"]');

    if (ownerLink) {
        const ownerName = ownerLink.textContent.trim();
        if (ownerName) {
            if (feed.length == 4) {
            const usernameContainer = feed[0];
            const textContainer = feed[1];
            const imageContainer = feed[2];
            const bannerContainer = feed[3];
            } 
            else {
                const usernameContainer = feed[0];
                const textContainer = feed[1];
                const bannerContainer = feed[2];
            }
        }
    }
  });