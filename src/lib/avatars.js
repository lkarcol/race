export const avatarColors = [
  "#f5bfa6",
  "#c9d8ed",
  "#edcf76",
  "#c8d7bb",
  "#d4c4e8",
  "#eabdbb",
  "#bcd9d7",
  "#e5c9a7",
];
export function avatarSvg(seed = 0) {
  const i = Number(seed) % 8;
  const skins = [
    "#e9b28e",
    "#f0c7a5",
    "#b87955",
    "#f1c8a0",
    "#d99b73",
    "#a86e4c",
    "#e5b68e",
    "#edbf9a",
  ];
  const hair = [
    "#3c3029",
    "#b26c39",
    "#352925",
    "#8b572f",
    "#262e31",
    "#312725",
    "#b89759",
    "#54382f",
  ];
  const shirt = [
    "#f36c46",
    "#4f755d",
    "#f7ecd4",
    "#657c9e",
    "#a4708e",
    "#e9b64c",
    "#517e7a",
    "#b9654c",
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${avatarColors[i]}"/><path d="M9 85Q10 57 32 57h16q22 0 24 28" fill="${shirt[i]}" stroke="#3b382f" stroke-width="1.7"/><path d="M32 51v11q8 8 16 0V51" fill="${skins[i]}" stroke="#3b382f" stroke-width="1.4"/>${i % 3 === 1 ? `<path d="M20 47V28Q19 8 40 8t21 20v31H20" fill="${hair[i]}"/>` : ""}<ellipse cx="23" cy="36" rx="4" ry="6" fill="${skins[i]}"/><ellipse cx="57" cy="36" rx="4" ry="6" fill="${skins[i]}"/><path d="M23 27q0-18 17-18t17 18v12q0 17-17 18T23 39Z" fill="${skins[i]}" stroke="#3b382f" stroke-width="1.7"/><path d="M22 31Q17 9 35 8q22-5 24 18l-7 6-2-13q-10 10-24 7l-1 9Z" fill="${hair[i]}"/><path d="M29 32h6m11 0h6" stroke="#3b382f" stroke-width="1.5" stroke-linecap="round"/><circle cx="32" cy="36" r="1.5" fill="#3b382f"/><circle cx="48" cy="36" r="1.5" fill="#3b382f"/><path d="m40 36-2 7h4m-8 5q6 5 12 0" fill="none" stroke="#684b38" stroke-width="1.5" stroke-linecap="round"/>${i === 3 || i === 6 ? '<g fill="none" stroke="#3b382f" stroke-width="1.5"><rect x="26" y="32" width="12" height="10" rx="3"/><rect x="42" y="32" width="12" height="10" rx="3"/><path d="M38 35h4"/></g>' : ""}</svg>`;
}
export function avatarUrl(value = "seed:0") {
  return value.startsWith("data:image/jpeg;")
    ? value
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(avatarSvg(value.split(":")[1] || 0))}`;
}
export async function resizePhoto(file) {
  if (!file?.type.startsWith("image/"))
    throw new Error("Choose an image from your gallery.");
  if (file.size > 15 * 1024 * 1024)
    throw new Error("Please choose a photo smaller than 15 MB.");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 160;
  const ctx = canvas.getContext("2d");
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    160,
    160,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}
