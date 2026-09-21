(() => {
  "use strict";

  const STORAGE_KEYS = {
    checklist: "cathlab-discharge:checklist",
    meds: "cathlab-discharge:meds",
    site: "cathlab-discharge:site",
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Storage may be unavailable (e.g. private mode) - fail silently.
    }
  }

  function initChecklists() {
    const checkedState = loadJSON(STORAGE_KEYS.checklist, {});

    document.querySelectorAll(".checklist li").forEach((item, index) => {
      const list = item.closest("[data-checklist]");
      const listId = list ? list.dataset.checklist : "list";
      const itemId = `${listId}-${index}-${item.textContent.trim().slice(0, 24)}`;
      item.dataset.itemId = itemId;

      if (checkedState[itemId]) {
        item.classList.add("checked");
      }

      item.addEventListener("click", () => {
        item.classList.toggle("checked");
        checkedState[itemId] = item.classList.contains("checked");
        saveJSON(STORAGE_KEYS.checklist, checkedState);
      });
    });
  }

  function initAccessSiteSelector() {
    const select = document.getElementById("access-site");
    if (!select) return;

    const woundParagraphs = document.querySelectorAll("#wound-care-content [data-site]");

    function applySite(site) {
      woundParagraphs.forEach((p) => {
        p.hidden = p.dataset.site !== site;
      });
    }

    const savedSite = loadJSON(STORAGE_KEYS.site, null);
    if (savedSite) {
      select.value = savedSite;
    }
    applySite(select.value);

    select.addEventListener("change", () => {
      applySite(select.value);
      saveJSON(STORAGE_KEYS.site, select.value);
    });
  }

  function initMedicationTracker() {
    const list = document.getElementById("med-list");
    const form = document.getElementById("med-form");
    const input = document.getElementById("med-name");
    if (!list || !form || !input) return;

    let meds = loadJSON(STORAGE_KEYS.meds, []);

    function render() {
      list.innerHTML = "";
      if (meds.length === 0) {
        const empty = document.createElement("p");
        empty.className = "hint";
        empty.textContent = "No medications added yet.";
        list.appendChild(empty);
        return;
      }
      meds.forEach((med, index) => {
        const row = document.createElement("div");
        row.className = "med-item";

        const label = document.createElement("span");
        label.textContent = med;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "Remove";
        removeBtn.setAttribute("aria-label", `Remove ${med}`);
        removeBtn.addEventListener("click", () => {
          meds.splice(index, 1);
          saveJSON(STORAGE_KEYS.meds, meds);
          render();
        });

        row.appendChild(label);
        row.appendChild(removeBtn);
        list.appendChild(row);
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      meds.push(value);
      saveJSON(STORAGE_KEYS.meds, meds);
      input.value = "";
      render();
      input.focus();
    });

    render();
  }

  function initOfflineBanner() {
    const banner = document.getElementById("offline-banner");
    if (!banner) return;

    function update() {
      banner.hidden = navigator.onLine;
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
  }

  function initInstallPrompt() {
    const installBtn = document.getElementById("install-btn");
    if (!installBtn) return;
    let deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      installBtn.hidden = false;
    });

    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      installBtn.hidden = true;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });

    window.addEventListener("appinstalled", () => {
      installBtn.hidden = true;
    });
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        // Registration failures (e.g. unsupported protocol) should not break the app.
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initChecklists();
    initAccessSiteSelector();
    initMedicationTracker();
    initOfflineBanner();
    initInstallPrompt();
  });

  initServiceWorker();
})();
