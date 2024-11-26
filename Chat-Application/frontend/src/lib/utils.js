export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    year: "2-digit",
    month: "short",
    minute: "2-digit",
    hour12: true,
  });
}
