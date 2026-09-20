document.querySelectorAll('input[type="password"]').forEach((input) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'password-toggle';
  button.textContent = document.documentElement.lang === 'en' ? 'Show' : 'Göster';
  button.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Show password' : 'Şifreyi göster');
  input.insertAdjacentElement('afterend', button);
  button.addEventListener('click', () => {
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.textContent = document.documentElement.lang === 'en' ? (visible ? 'Hide' : 'Show') : (visible ? 'Gizle' : 'Göster');
    button.setAttribute('aria-label', document.documentElement.lang === 'en' ? (visible ? 'Hide password' : 'Show password') : (visible ? 'Şifreyi gizle' : 'Şifreyi göster'));
    input.focus();
  });
});
