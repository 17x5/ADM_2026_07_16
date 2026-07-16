function updateSvgNode(cx, cy, color, text) {
  const node = document.getElementById('wellePunkt');
  const label = document.getElementById('welleIstLabel');
  if(node && label) {
    node.setAttribute('cx', cx);
    node.setAttribute('cy', cy);
    node.style.fill = color;
    node.style.stroke = color;
    
    label.setAttribute('x', cx);
    label.setAttribute('y', cy - 15);
    label.style.fill = color;
    label.textContent = text;
  }
}
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString('de-CH', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) + " Uhr";
}
