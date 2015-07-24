function toggle() {
  var overlay = document.querySelector('.glass-parent');
  if (overlay.classList.contains('down')) {
    overlay.classList.add('up');
    overlay.classList.remove('down');
  } else {
    overlay.classList.add('down');
    overlay.classList.remove('up');
  }
}

function toggleChecks() {
  var layerChecks = [
    ['#contentCheck', '.content'],
    ['#blurCheck', '.blur'],
    ['#tintCheck', '.tint'],
    ['#bgCheck', '.background']
  ], check, layer;
  layerChecks.forEach(function(layerCheck) {
    check = document.querySelector(layerCheck[0]);
    layer = document.querySelector(layerCheck[1]);
    if (check.checked)
      layer.style.opacity = 1;
    else
      layer.style.opacity = 0;
  });
  var classChecks = [
    ['#check3d', '.glass-parent', 'three-d'],
    ['#clipCheck', '.glass-parent', 'clip']
  ];
  classChecks.forEach(function(classCheck) {
    check = document.querySelector(classCheck[0]);
    layer = document.querySelector(classCheck[1]);
    if (check.checked)
      layer.classList.add(classCheck[2]);
    else
      layer.classList.remove(classCheck[2]);
  });
}

window.onload = function() {
  /* transition support ~= classList support */
  var preload = document.querySelector('.preload');
  preload.classList.remove('preload');
}