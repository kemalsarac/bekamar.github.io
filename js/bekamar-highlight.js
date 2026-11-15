(() => {
  const colorName = 'bekamar-highlight';
  const blockedTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION']);

  function isEligible(textNode) {
    const parent = textNode.parentElement;
    if (!parent || parent.closest(`.${colorName}`)) return false;
    if (blockedTags.has(parent.tagName) || parent.isContentEditable) return false;
    return /bekamar/i.test(textNode.nodeValue || '');
  }

  function highlightTextNode(textNode) {
    if (!isEligible(textNode)) return;
    const value = textNode.nodeValue;
    const expression = /bekamar(?:\s+galleria)?/gi;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let highlighted = false;
    for (const match of value.matchAll(expression)) {
      // Leave email addresses in their normal inherited color.
      if (match.index > 0 && value[match.index - 1] === '@') continue;
      if (match.index > cursor) fragment.append(document.createTextNode(value.slice(cursor, match.index)));
      const highlight = document.createElement('span');
      highlight.className = colorName;
      highlight.textContent = match[0];
      fragment.append(highlight);
      cursor = match.index + match[0].length;
      highlighted = true;
    }
    if (!highlighted) return;
    if (cursor < value.length) fragment.append(document.createTextNode(value.slice(cursor)));
    textNode.replaceWith(fragment);
  }

  function scan(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      highlightTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest?.(`.${colorName}`)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(highlightTextNode);
  }

  scan(document.body);
  new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(scan));
  }).observe(document.body, { childList: true, subtree: true });
})();
