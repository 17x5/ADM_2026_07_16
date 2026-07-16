function toggleActionBox() {
  const box = document.getElementById('actionBox');
  const icon = document.getElementById('actionToggleIcon');
  if (box.classList.contains('open')) {
    box.classList.remove('remove');
    box.classList.remove('open');
    icon.textContent = '▶ Anzeigen';
  } else {
    box.classList.add('open');
    icon.textContent = '▼ Verbergen';
  }
}

function toggleKachelFazit(boxId) {
  const box = document.getElementById(boxId);
  const icon = box.querySelector('.action-toggle-icon');
  if (box.classList.contains('open')) {
    box.classList.remove('open');
    icon.textContent = '▶ Anzeigen';
  } else {
    box.classList.add('open');
    icon.textContent = '▼ Verbergen';
  }
}

function getEmojiColor(color) {
  if (color === 'gruen') return '🟢';
  if (color === 'gelb') return '🟡';
  if (color === 'rot') return '🔴';
  if (color === 'purple') return '🟣';
  if (color === 'orange') return '🟠';
  return '⚪';
}

function getHexColor(color) {
  if (color === 'gruen') return 'var(--green)';
  if (color === 'gelb') return 'var(--yellow)';
  if (color === 'rot') return 'var(--red)';
  if (color === 'purple') return 'var(--purple)';
  if (color === 'orange') return 'var(--orange)';
  return '#8b98a5';
}

function buildQuickRowHTML(color, title, sub, valPercent, valString) {
  return `
    <div class="quick-row">
      <div class="q-ampel">${getEmojiColor(color)}</div>
      <div class="q-bar-container">
        <div class="q-bar-fill" style="width: ${valPercent}%; background-color: ${getHexColor(color)};"></div>
      </div>
      <div class="q-val">${valString}</div>
      <div class="q-arrow" style="color: ${getHexColor(color)};">▲</div>
      <div class="q-text"><b>${title}</b><span class="q-desc">${sub}</span></div>
    </div>
  `;
}
