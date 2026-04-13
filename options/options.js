const DEFAULTS_KEY = 'subtitleHider_defaults';

function getDefaults() {
  try { return JSON.parse(localStorage.getItem(DEFAULTS_KEY) || 'null') || { opacity: 1 }; } catch { return { opacity: 1 }; }
}

function saveDefaults(d) {
  try { localStorage.setItem(DEFAULTS_KEY, JSON.stringify(d)); } catch {}
}

// Load defaults
const defaults = getDefaults();
const opacitySlider = document.getElementById('default-opacity');
const opacityVal = document.getElementById('opacity-val');
opacitySlider.value = defaults.opacity;
opacityVal.textContent = parseFloat(defaults.opacity).toFixed(2);

opacitySlider.addEventListener('input', () => {
  const val = parseFloat(opacitySlider.value);
  opacityVal.textContent = val.toFixed(2);
  defaults.opacity = val;
  saveDefaults(defaults);
});

// Reset all settings
document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all per-site settings and defaults?')) return;
  // Clear all subtitleHider_ keys
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('subtitleHider')) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {}
  opacitySlider.value = 1;
  opacityVal.textContent = '1.00';
  // Also clear chrome storage active tabs
  try { chrome.storage.local.remove('activeTabs'); } catch {}
});
