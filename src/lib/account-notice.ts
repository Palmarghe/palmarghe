export function accountNotice(notice: string, locale: 'tr' | 'en'): string {
  if (notice === 'logout_unconfirmed') return locale === 'tr'
    ? 'Sunucu tarafındaki oturum iptali doğrulanamadı. Oturum durumunu kontrol edin ve diğer cihazlarınızdan ayrıca çıkış yapın.'
    : 'Server-side session revocation could not be confirmed. Check your session status and sign out separately on your other devices.';
  return locale === 'tr' ? 'E-postanızı kontrol edin.' : 'Check your email.';
}
