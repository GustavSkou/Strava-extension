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
      if (!owner) 
        return;

      const ownerName = owner.textContent.trim().toLowerCase();
      const isTarget = normalizedNames.some((target) => ownerName.includes(target));

      if (isTarget) {
        if (hideMaps) {
          hideActivityMap(entry);
        } else if (settings.hidePicture) {
          hideActivityImage(entry);
        }
        
        if (settings.hideDescription) {
          hideActivityDescription(entry);
        }

        if (settings.hideName) {
          hideActivityName(entry);
        }
      }
    });
  }

/**
 *  hidePicture: false,
    hideDescription: false,
    hideName: false,
 */

  const blockedAthletes = await service.loadUsers();
  const settings = await service.loadSettings();

  const feedContainer = document.querySelector('.feature-feed') || document.body;
  const feedObserver = new MutationObserver(() => hideAthletesMedia(blockedAthletes));
  hideAthletesMedia(blockedAthletes);
  feedObserver.observe(feedContainer, { childList: true, subtree: true });
})();

function hideActivityImage(activity) {
  const mediaItems = activity.querySelectorAll('[data-testid="photo"], [data-testid="video"]');
  mediaItems.forEach((item) => item.style.setProperty("display", "none", "important"));
}

function hideActivityDescription(activity) {
  const constDescription = activity.querySelectorAll('[data-testid="activity_description_wrapper"]');
  constDescription.forEach((item) => item.style.setProperty("display", "none", "important"));
}

function hideActivityName(activity) {
  const name = activity.querySelector(
  '[data-testid="activity_entry_container"] h3'
  );

  const activityType = activity.querySelector('[data-testid="activity-icon"] title').textContent;

  if (name && name.textContent !== activityType) {
    name.textContent = activityType;
  }
}

function hideActivityMap(activity) {
  const container = activity.querySelector('[data-testid="entry-images"]');
  if (container) container.style.setProperty("display", "none", "important");
}