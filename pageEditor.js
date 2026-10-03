(async () => {
  const service = new PersistenceService();

  function hideAthletesMedia(targetNames = [], hideMaps = false) {
    const normalizedNames = (Array.isArray(targetNames) ? targetNames : [])
      .filter((name) => typeof name === "string")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);
    const entries = document.querySelectorAll('[data-testid="web-feed-entry"]');

    entries.forEach((entry) => {
      const owner = entry.querySelector('[data-testid="owners-name"]');
      if (!owner) return;

      const ownerName = owner.textContent.trim().toLowerCase();
      const isTarget = normalizedNames.some((target) => ownerName.includes(target));

      if (isTarget) {
        if (hideMaps) {
          const container = entry.querySelector('[data-testid="entry-images"]');
          if (container) container.style.setProperty("display", "none", "important");
        } else if (settings.hidePicture) {
          const mediaItems = entry.querySelectorAll('[data-testid="photo"], [data-testid="video"]');
          mediaItems.forEach((item) => item.style.setProperty("display", "none", "important"));
        }
        if (settings.hideDescription) {
            
        }

        if (settings.hideName) {
            
        }
      }
    });
  }

/**
 *     hidePicture: false,
    hideDescription: false,
    hideName: false,
 */

  const blockedAthletes = await service.loadUsers();
  const settings = await service.loadSettings();

  const feedContainer = document.querySelector('.feature-feed') || document.body;
  const feedObserver = new MutationObserver(() => hideAthletesMedia(blockedAthletes));
  feedObserver.observe(feedContainer, { childList: true, subtree: true });
})();