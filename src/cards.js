// Card content: real ML algorithms and the math behind them.
// Each card = category + illustration (48×32 SVG) + name + formula. Pairs match on `id`.
// SVG classes (styled in styles.css): .ax neutral axes/guides · .pt filled point ·
// .ho hollow point · .res dashed residual · .soft faded · .area translucent fill.
window.FR_CATEGORIES = {
  sup: 'Supervised',
  uns: 'Unsupervised',
  math: 'Math',
};

window.FR_CARDS = [
  // ---- Supervised ----------------------------------------------------------
  { id: 'linreg', cat: 'sup', name: 'Linear regression',
    formula: '<i>ŷ</i> = <b>w</b><sup>⊤</sup><b>x</b> + <i>b</i>',
    svg: `<path class="ax" d="M4 3v26h41"/>
      <path class="res" d="M10 20v3M15 23.5v-3M19 15v3.5M25 17.5v-2M29 11v2.5M34 13v-2M39 7v1.5"/>
      <path d="M6 25L44 6" stroke-width="1.5"/>
      <g class="pt"><circle cx="10" cy="20" r="1.4"/><circle cx="15" cy="23.5" r="1.4"/><circle cx="19" cy="15" r="1.4"/><circle cx="25" cy="17.5" r="1.4"/><circle cx="29" cy="11" r="1.4"/><circle cx="34" cy="13" r="1.4"/><circle cx="39" cy="7" r="1.4"/></g>` },

  { id: 'logreg', cat: 'sup', name: 'Logistic regression',
    formula: '<i>σ</i>(<i>z</i>) = 1/(1+<i>e</i><sup>−<i>z</i></sup>)',
    svg: `<path class="ax" d="M4 3v26h41"/><path class="ax dash" d="M4 16h40"/>
      <path d="M5 25.5C17 25.5 20 24 24 16S31 6.5 44 6.5" stroke-width="1.5"/>
      <g class="ho"><circle cx="8" cy="25.5" r="1.4"/><circle cx="12" cy="25.5" r="1.4"/><circle cx="17" cy="25.5" r="1.4"/><circle cx="26" cy="25.5" r="1.4"/></g>
      <g class="pt"><circle cx="21" cy="6.5" r="1.4"/><circle cx="30" cy="6.5" r="1.4"/><circle cx="35" cy="6.5" r="1.4"/><circle cx="40" cy="6.5" r="1.4"/></g>` },

  { id: 'tree', cat: 'sup', name: 'Decision tree',
    formula: 'Gini = 1 − Σ<sub><i>k</i></sub> <i>p</i><sub><i>k</i></sub><sup>2</sup>',
    svg: `<path class="soft" d="M24 8l-12 5M24 8l12 5M12 19l-6 6M12 19l6 6M36 19l-6 6M36 19l6 6"/>
      <rect x="18" y="2.5" width="12" height="6" rx="1.5"/><rect x="6" y="13" width="12" height="6" rx="1.5"/><rect x="30" y="13" width="12" height="6" rx="1.5"/>
      <g class="pt"><circle cx="6" cy="27" r="2.2"/><circle cx="30" cy="27" r="2.2"/><circle cx="42" cy="27" r="2.2"/></g>
      <circle class="ho" cx="18" cy="27" r="2.2"/>` },

  { id: 'svm', cat: 'sup', name: 'SVM',
    formula: 'max 2 / ‖<b>w</b>‖',
    svg: `<path d="M10 30L38 2" stroke-width="1.5"/><path class="dash" d="M4 30L32 2M16 30L44 2"/>
      <g class="ho"><circle cx="8" cy="12" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="13" cy="15" r="1.5"/><circle cx="6" cy="20" r="1.5"/></g>
      <g class="pt"><circle cx="33" cy="23" r="1.5"/><circle cx="39" cy="17" r="1.5"/><circle cx="41" cy="26" r="1.5"/><circle cx="31" cy="28" r="1.5"/></g>
      <circle class="ho" cx="20" cy="14" r="1.5"/><circle cx="20" cy="14" r="3.2" stroke-width=".9"/>
      <circle class="pt" cx="26" cy="20" r="1.5"/><circle cx="26" cy="20" r="3.2" stroke-width=".9"/>` },

  { id: 'knn', cat: 'sup', name: 'k-NN',
    formula: '<i>d</i> = ‖<b>x</b> − <b>x</b><sub><i>i</i></sub>‖<sub>2</sub>',
    svg: `<circle class="dash" cx="24" cy="16" r="9.5"/>
      <g class="pt"><circle cx="20" cy="10" r="1.5"/><circle cx="29" cy="13" r="1.5"/><circle cx="22" cy="22" r="1.5"/><circle cx="39" cy="17" r="1.5"/><circle cx="35" cy="27" r="1.5"/></g>
      <g class="ho"><circle cx="29" cy="21" r="1.5"/><circle cx="7" cy="8" r="1.5"/><circle cx="10" cy="24" r="1.5"/><circle cx="41" cy="6" r="1.5"/><circle cx="6" cy="16" r="1.5"/></g>
      <path d="M24 13v6M21 16h6" stroke-width="1.6"/>` },

  { id: 'nb', cat: 'sup', name: 'Naive Bayes',
    formula: '<i>P</i>(<i>y</i>|<b>x</b>) ∝ <i>P</i>(<i>y</i>) ∏ <i>P</i>(<i>x</i><sub><i>i</i></sub>|<i>y</i>)',
    svg: `<path class="ax" d="M3 28h42"/>
      <path class="area" d="M4 28C12 28 13 6 17 6S22 28 30 28Z"/>
      <path class="area soft" d="M18 28C26 28 27 10 31 10S36 28 44 28Z"/>
      <path class="ax dash" d="M24 4v24"/>` },

  { id: 'rf', cat: 'sup', name: 'Random forest',
    formula: '<i>ŷ</i> = <sup>1</sup>⁄<sub><i>T</i></sub> Σ<sub><i>t</i></sub> <i>h</i><sub><i>t</i></sub>(<b>x</b>)',
    svg: `<g class="soft"><path d="M9 5l-4 7M9 5l4 7M24 5l-4 7M24 5l4 7M39 5l-4 7M39 5l4 7"/><path d="M9 16l13 8M24 16v8M39 16l-13 8"/></g>
      <g class="pt"><circle cx="9" cy="4.5" r="2"/><circle cx="24" cy="4.5" r="2"/><circle cx="39" cy="4.5" r="2"/></g>
      <g class="ho"><circle cx="5" cy="13" r="1.6"/><circle cx="13" cy="13" r="1.6"/><circle cx="20" cy="13" r="1.6"/><circle cx="28" cy="13" r="1.6"/><circle cx="35" cy="13" r="1.6"/><circle cx="43" cy="13" r="1.6"/></g>
      <rect x="19" y="24" width="10" height="6" rx="1.5"/><path d="M22 27h4" stroke-width="1.3"/>` },

  { id: 'nn', cat: 'sup', name: 'Neural network',
    formula: '<b>a</b> = <i>σ</i>(<i>W</i><b>x</b> + <b>b</b>)',
    svg: `<g class="soft" stroke-width=".7"><path d="M8 9L24 5M8 9L24 12M8 9L24 20M8 9L24 27M8 16L24 5M8 16L24 12M8 16L24 20M8 16L24 27M8 23L24 5M8 23L24 12M8 23L24 20M8 23L24 27M24 5L40 12M24 12L40 12M24 20L40 12M24 27L40 12M24 5L40 20M24 12L40 20M24 20L40 20M24 27L40 20"/></g>
      <g class="ho"><circle cx="8" cy="9" r="2.3"/><circle cx="8" cy="16" r="2.3"/><circle cx="8" cy="23" r="2.3"/><circle cx="24" cy="5" r="2.3"/><circle cx="24" cy="12" r="2.3"/><circle cx="24" cy="20" r="2.3"/><circle cx="24" cy="27" r="2.3"/></g>
      <g class="pt"><circle cx="40" cy="12" r="2.3"/><circle cx="40" cy="20" r="2.3"/></g>` },

  // ---- Unsupervised --------------------------------------------------------
  { id: 'kmeans', cat: 'uns', name: 'k-means',
    formula: 'min Σ ‖<b>x</b> − <b>μ</b><sub><i>k</i></sub>‖<sup>2</sup>',
    svg: `<path class="ax dash" d="M24 16L22 1M24 16L3 30M24 16L46 26"/>
      <g class="pt"><circle cx="7" cy="8" r="1.4"/><circle cx="11" cy="4.5" r="1.4"/><circle cx="14" cy="9" r="1.4"/><circle cx="8" cy="14" r="1.4"/><circle cx="14" cy="14" r="1.4"/></g>
      <g class="ho"><circle cx="31" cy="5" r="1.4"/><circle cx="37" cy="4" r="1.4"/><circle cx="41" cy="9" r="1.4"/><circle cx="33" cy="11" r="1.4"/><circle cx="38" cy="14" r="1.4"/></g>
      <g class="pt soft"><rect x="17" y="21" width="2.6" height="2.6"/><rect x="21" y="27" width="2.6" height="2.6"/><rect x="26" y="25" width="2.6" height="2.6"/><rect x="28" y="20" width="2.6" height="2.6"/><rect x="31" y="27" width="2.6" height="2.6"/></g>
      <path d="M9.5 7.5l3 3M12.5 7.5l-3 3M34.5 6.5l3 3M37.5 6.5l-3 3M23.5 22.5l3 3M26.5 22.5l-3 3" stroke-width="1.6"/>` },

  { id: 'pca', cat: 'uns', name: 'PCA',
    formula: 'Σ<b>v</b> = <i>λ</i><b>v</b>',
    svg: `<ellipse class="ax dash" cx="24" cy="16" rx="19" ry="6.5" transform="rotate(-30 24 16)"/>
      <g class="pt soft"><circle cx="11" cy="24" r="1.2"/><circle cx="15" cy="20" r="1.2"/><circle cx="14" cy="25" r="1.2"/><circle cx="19" cy="19" r="1.2"/><circle cx="21" cy="14" r="1.2"/><circle cx="26" cy="17" r="1.2"/><circle cx="29" cy="11" r="1.2"/><circle cx="31" cy="15" r="1.2"/><circle cx="35" cy="9" r="1.2"/><circle cx="38" cy="7" r="1.2"/><circle cx="18" cy="23" r="1.2"/><circle cx="33" cy="12" r="1.2"/></g>
      <path d="M24 16L38.5 7.6M24 16L20.3 9.6" stroke-width="1.6"/>
      <path d="M35 7.4l3.5.2-1.6 3.1M19 12.5l1.3-2.9 2.3 2.1" stroke-width="1.3"/>` },

  { id: 'dbscan', cat: 'uns', name: 'DBSCAN',
    formula: '|<i>N</i><sub><i>ε</i></sub>(<i>p</i>)| ≥ minPts',
    svg: `<g class="dash soft"><circle cx="12" cy="13" r="5"/><circle cx="20" cy="17" r="5"/><circle cx="28" cy="15" r="5"/></g>
      <g class="pt"><circle cx="12" cy="13" r="1.5"/><circle cx="15" cy="10" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="20" cy="17" r="1.5"/><circle cx="23" cy="20" r="1.5"/><circle cx="24" cy="14" r="1.5"/><circle cx="28" cy="15" r="1.5"/><circle cx="9" cy="16" r="1.5"/></g>
      <circle class="ho" cx="32" cy="19" r="1.5"/>
      <g class="ax"><path d="M39 5l3 3M42 5l-3 3M38 25l3 3M41 25l-3 3"/></g>` },

  { id: 'hclust', cat: 'uns', name: 'Hierarchical',
    formula: '<i>d</i>(<i>A</i>,<i>B</i>) = min <i>d</i>(<i>a</i>,<i>b</i>)',
    svg: `<path class="ax dash" d="M2 14h44"/>
      <path d="M6 28v-6h6v6M20 28v-8h6v8M36 28v-10h6v10M9 22v-10h14v8M16 12v-7h23v13" stroke-linejoin="miter"/>
      <g class="pt"><circle cx="6" cy="28" r="1.4"/><circle cx="12" cy="28" r="1.4"/><circle cx="20" cy="28" r="1.4"/><circle cx="26" cy="28" r="1.4"/><circle cx="36" cy="28" r="1.4"/><circle cx="42" cy="28" r="1.4"/></g>` },

  { id: 'gmm', cat: 'uns', name: 'Gaussian mixture',
    formula: '<i>p</i>(<b>x</b>) = Σ <i>π</i><sub><i>k</i></sub> 𝒩(<b>μ</b><sub><i>k</i></sub>, Σ<sub><i>k</i></sub>)',
    svg: `<g transform="rotate(-25 15 18)"><ellipse class="area soft" cx="15" cy="18" rx="11" ry="6"/><ellipse cx="15" cy="18" rx="6" ry="3.2"/></g>
      <g transform="rotate(25 33 13)"><ellipse class="area soft" cx="33" cy="13" rx="10" ry="6"/><ellipse cx="33" cy="13" rx="5.5" ry="3.2"/></g>
      <g class="pt"><circle cx="15" cy="18" r="1.4"/><circle cx="33" cy="13" r="1.4"/></g>` },

  { id: 'ae', cat: 'uns', name: 'Autoencoder',
    formula: 'min ‖<b>x</b> − <i>g</i>(<i>f</i>(<b>x</b>))‖<sup>2</sup>',
    svg: `<path class="area" d="M5 3L19 11V21L5 29Z"/><path class="area" d="M29 11L43 3V29L29 21Z"/>
      <rect class="pt" x="21" y="12" width="6" height="8" rx="1.2"/>
      <path class="ax" d="M19 16h2M27 16h2"/>` },

  // ---- Math ----------------------------------------------------------------
  { id: 'gd', cat: 'math', name: 'Gradient descent',
    formula: '<i>θ</i> ← <i>θ</i> − <i>η</i> ∇<i>J</i>(<i>θ</i>)',
    svg: `<g class="ax"><ellipse cx="30" cy="17" rx="16" ry="12"/><ellipse cx="30" cy="17" rx="10.5" ry="7.8"/><ellipse cx="30" cy="17" rx="5.2" ry="3.8"/></g>
      <path d="M8 5L16 13L20 8L25 15L27.5 12.5L30 17" stroke-width="1.4"/>
      <g class="pt"><circle cx="8" cy="5" r="1.3"/><circle cx="16" cy="13" r="1.3"/><circle cx="20" cy="8" r="1.3"/><circle cx="25" cy="15" r="1.3"/><circle cx="27.5" cy="12.5" r="1.3"/><circle cx="30" cy="17" r="2"/></g>` },

  { id: 'mse', cat: 'math', name: 'MSE loss',
    formula: '<sup>1</sup>⁄<sub><i>n</i></sub> Σ (<i>y</i><sub><i>i</i></sub> − <i>ŷ</i><sub><i>i</i></sub>)<sup>2</sup>',
    svg: `<path class="ax" d="M4 3v26h41"/>
      <path d="M6 22L44 10" stroke-width="1.5"/>
      <g class="area"><rect x="12" y="13" width="7" height="7"/><rect x="24" y="16.4" width="5.6" height="5.6"/><rect x="36" y="8" width="4.5" height="4.5"/></g>
      <g class="pt"><circle cx="12" cy="13" r="1.4"/><circle cx="24" cy="22" r="1.4"/><circle cx="36" cy="8" r="1.4"/></g>` },

  { id: 'ce', cat: 'math', name: 'Cross-entropy',
    formula: '−Σ <i>y</i> log <i>ŷ</i>',
    svg: `<path class="ax" d="M4 3v26h41"/><path class="ax dash" d="M43 3v26"/>
      <path d="M6.5 3C8 18 16 25 43 27" stroke-width="1.5"/>
      <circle class="pt" cx="14" cy="19.6" r="1.6"/><path class="res" d="M14 19.6H4"/>` },

  { id: 'bayes', cat: 'math', name: "Bayes' theorem",
    formula: '<i>P</i>(<i>A</i>|<i>B</i>) ∝ <i>P</i>(<i>B</i>|<i>A</i>) <i>P</i>(<i>A</i>)',
    svg: `<rect class="ax" x="3" y="2.5" width="42" height="27" rx="2"/>
      <path class="area" d="M24 8A10 10 0 0 1 24 24A10 10 0 0 1 24 8Z"/>
      <circle cx="18" cy="16" r="10"/><circle cx="30" cy="16" r="10"/>` },

  { id: 'softmax', cat: 'math', name: 'Softmax',
    formula: '<i>e</i><sup><i>z</i><sub><i>i</i></sub></sup> / Σ<sub><i>j</i></sub> <i>e</i><sup><i>z</i><sub><i>j</i></sub></sup>',
    svg: `<path class="ax" d="M3 28h18M27 28h18"/>
      <rect x="5" y="14" width="4" height="14" rx=".8"/><rect x="11" y="7" width="4" height="21" rx=".8"/><rect x="17" y="19" width="4" height="9" rx=".8"/>
      <path class="soft" d="M22 16h4M24.5 14l2 2-2 2"/>
      <g class="pt"><rect x="29" y="22" width="4" height="6" rx=".8"/><rect x="35" y="5" width="4" height="23" rx=".8"/><rect x="41" y="26" width="4" height="2" rx=".8"/></g>` },

  { id: 'l2', cat: 'math', name: 'L2 regularization',
    formula: '<i>J</i>(<i>θ</i>) + <i>λ</i>‖<i>θ</i>‖<sup>2</sup>',
    svg: `<path class="ax" d="M15 2v28M2 20h44"/>
      <g class="soft"><ellipse cx="34" cy="9" rx="11" ry="6" transform="rotate(20 34 9)"/><ellipse cx="34" cy="9" rx="6" ry="3" transform="rotate(20 34 9)"/></g>
      <circle class="area" cx="15" cy="20" r="7.5"/>
      <circle class="pt" cx="21" cy="15.6" r="1.7"/><circle class="pt soft" cx="34" cy="9" r="1.3"/>` },

  { id: 'f1', cat: 'math', name: 'F1 score',
    formula: '<i>F</i><sub>1</sub> = 2<i>PR</i> / (<i>P</i> + <i>R</i>)',
    svg: `<rect class="area" x="11" y="3" width="12.5" height="12.5" rx="1.2"/><rect x="24.5" y="3" width="12.5" height="12.5" rx="1.2" class="soft"/>
      <rect x="11" y="16.5" width="12.5" height="12.5" rx="1.2" class="soft"/><rect class="area" x="24.5" y="16.5" width="12.5" height="12.5" rx="1.2"/>
      <g class="svg-label"><text x="17.2" y="11">TP</text><text x="30.7" y="11">FP</text><text x="17.2" y="24.5">FN</text><text x="30.7" y="24.5">TN</text></g>` },
];
