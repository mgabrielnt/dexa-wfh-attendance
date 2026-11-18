export function photoFileName(photoUrl: string): string {
  return photoUrl.split('/').pop() ?? photoUrl;
}
