export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
export function rankPlayers(players) {
  return [...players].sort((a, b) => {
    if (a.rank || b.rank) return (a.rank || 999) - (b.rank || 999);
    if (a.status === "caught" && b.status !== "caught") return 1;
    if (b.status === "caught" && a.status !== "caught") return -1;
    return (
      b.progress - a.progress ||
      b.score - a.score ||
      a.name.localeCompare(b.name)
    );
  });
}
