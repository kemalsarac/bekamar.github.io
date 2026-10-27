const branchDialog = document.getElementById('branchDialog');
if (branchDialog) {
  const openButtons = document.querySelectorAll('[data-branch-open]');
  const closeButton = branchDialog.querySelector('[data-branch-close]');
  let lastBranchOpener = null;

  function closeBranchDialog() {
    if (typeof branchDialog.close === 'function') branchDialog.close();
    else branchDialog.removeAttribute('open');
  }

  openButtons.forEach(button => {
    button.addEventListener('click', () => {
      lastBranchOpener = button;
      if (typeof branchDialog.showModal === 'function') branchDialog.showModal();
      else branchDialog.setAttribute('open', '');
      closeButton?.focus();
    });
  });

  closeButton?.addEventListener('click', closeBranchDialog);
  branchDialog.addEventListener('click', event => {
    if (event.target === branchDialog) closeBranchDialog();
  });
  branchDialog.addEventListener('close', () => lastBranchOpener?.focus());
}
