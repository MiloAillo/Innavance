export function formatToJid(phone: string): string {
  // 1. Remove all non-numeric characters (+, -, spaces, parentheses)
  let cleanNumber = phone.replace(/\D/g, '');

  // 2. Convert Indonesian numbers starting with 0 to international format (62)
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }

  // 3. Append the standard user domain
  return `${cleanNumber}@s.whatsapp.net`;
}