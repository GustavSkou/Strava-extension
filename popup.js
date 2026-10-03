document.addEventListener("DOMContentLoaded", async () => {
  let usernames = [];
  let service;

  // Elements
  const form = document.getElementById("addForm");
  const input = document.getElementById("usernameInput");
  const userList = document.getElementById("userList");
  const savedCount = document.getElementById("savedCount");

  const toggles = {
    hidePicture: document.getElementById("hidePicture"),
    hideDescription: document.getElementById("hideDescription"),
    hideName: document.getElementById("hideName"),
  };

  let settings = {
    hidePicture: false,
    hideDescription: false,
    hideName: false,
  };

  async function saveState() {
    try {
      await service.saveState(usernames, settings);
      return true;
    } catch (error) {
      console.error("Failed to save extension state.", error);
      return false;
    }
  }

  function applySettingsToUI() {
    Object.keys(toggles).forEach((key) => {
      if (toggles[key]) {
        toggles[key].checked = !!settings[key];
      }
    });
  }

  // Render list and update badge count
  function renderUsernames() {
    userList.innerHTML = "";
    savedCount.textContent = `${usernames.length} saved`;

    if (usernames.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "empty-state";
      emptyItem.textContent = "No usernames added yet.";
      userList.appendChild(emptyItem);
      return;
    }

    usernames.forEach((name) => {
      const displayName = String(name);
      const li = document.createElement("li");
      li.className = "user-item";

      const info = document.createElement("div");
      info.className = "user-info";

      const atSign = document.createElement("span");
      atSign.className = "at-sign";
      atSign.textContent = "@";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = displayName;

      info.appendChild(atSign);
      info.appendChild(nameSpan);

      const copyBtn = document.createElement("button");
      copyBtn.className = "action-btn";
      copyBtn.type = "button";
      copyBtn.title = "Copy username";
      copyBtn.setAttribute("aria-label", `Copy ${displayName}`);
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(displayName).then(() => {
          copyBtn.style.color = "var(--primary)";
          setTimeout(() => {
            copyBtn.style.color = "";
          }, 1000);
        });
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn";
      removeBtn.type = "button";
      removeBtn.title = "Remove username";
      removeBtn.setAttribute("aria-label", `Remove ${displayName}`);
      removeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      `;
      removeBtn.addEventListener("click", async () => {
        const index = usernames.indexOf(name);
        if (index === -1) return;

        usernames.splice(index, 1);
        renderUsernames();
        if (!(await saveState())) {
          usernames.splice(index, 0, name);
          renderUsernames();
        }
      });

      li.appendChild(info);
      const actions = document.createElement("div");
      actions.className = "user-actions";
      actions.appendChild(copyBtn);
      actions.appendChild(removeBtn);
      li.appendChild(actions);
      userList.appendChild(li);
    });
  }

  // Add Username
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const value = input.value.trim().replace(/^@/, "").trim();
    if (!value) return;

    const exists = usernames.some(
      (username) => username.toLowerCase() === value.toLowerCase()
    );
    if (exists) return;

    usernames.unshift(value);
    renderUsernames();

    if (await saveState()) {
      input.value = "";
      input.focus();
    } else {
      usernames.shift();
      renderUsernames();
    }
  });

  // Toggle Handlers
  Object.keys(toggles).forEach((key) => {
    toggles[key].addEventListener("change", async (e) => {
      const previousValue = settings[key];
      settings[key] = e.target.checked;
      const saved = await saveState();
      if (!saved) {
        settings[key] = previousValue;
        e.target.checked = previousValue;
      }
    });
  });

  service = new PersistenceService();
  try {
    usernames = await service.loadUsers();
    settings = { ...settings, ...(await service.loadSettings()) };

    if (usernames.length === 0 && globalThis.localStorage) {
      const legacyUsers = JSON.parse(
        globalThis.localStorage.getItem("usernames") || "[]"
      );
      const legacySettings = JSON.parse(
        globalThis.localStorage.getItem("settings") || "{}"
      );

      if (Array.isArray(legacyUsers)) {
        usernames = legacyUsers
          .filter((username) => typeof username === "string")
          .map((username) => username.trim())
          .filter(Boolean);
      }
      if (legacySettings && typeof legacySettings === "object") {
        settings = { ...settings, ...legacySettings };
      }
      if (usernames.length > 0) {
        await service.saveState(usernames, settings);
        globalThis.localStorage.removeItem("usernames");
        globalThis.localStorage.removeItem("settings");
      }
    }
  } catch (error) {
    console.error("Failed to load extension state.", error);
  }

  renderUsernames();
  applySettingsToUI();
});