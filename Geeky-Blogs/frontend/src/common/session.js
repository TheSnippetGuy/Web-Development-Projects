export function storeInSession(key, value) {
  return sessionStorage.setItem(key, value);
}
export function lookInSession(key) {
  return sessionStorage.getItem(key);
}
export function removeFromSession(key) {
  return sessionStorage.removeItem(key);
}
export function logOutUser() {
  return sessionStorage.clear();
}
