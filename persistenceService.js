class PersistenceService {
    async saveState(usernames, settings) {
        await chrome.storage.local.set({ usernames, settings });
    }

    async loadUsers() {
        const result = await chrome.storage.local.get('usernames');
        return Array.isArray(result.usernames)
            ? result.usernames.filter((username) => typeof username === 'string')
            : [];
    }

    async loadSettings() {
        const result = await chrome.storage.local.get('settings');
        return result.settings && typeof result.settings === 'object' && !Array.isArray(result.settings)
            ? result.settings
            : {};
    }
}