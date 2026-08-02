export function formatToJid(phone: string): string {
  // 1. Remove all non-numeric characters (+, -, spaces, parentheses)
  const cleanNumber = phone.replace(/\D/g, '');

  // 2. Append the standard user domain
  return `${cleanNumber}@s.whatsapp.net`;
}