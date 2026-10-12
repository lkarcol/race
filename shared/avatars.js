export const AVATAR_MAX_LENGTH = 70000;

const SEED = /^seed:[0-7]$/;
const PHOTO =
  /^data:image\/jpeg(?:;charset=[\w-]+)?;base64,[A-Za-z0-9+/=]+$/;

export function isSeedAvatar(value) {
  return typeof value === "string" && SEED.test(value);
}

export function isPhotoAvatar(value) {
  if (typeof value !== "string" || value.length > AVATAR_MAX_LENGTH)
    return false;
  return PHOTO.test(value.replace(/\s/g, ""));
}

export function normalizeAvatar(value) {
  const avatar = String(value ?? "seed:0").replace(/\s/g, "");
  if (isSeedAvatar(avatar)) return avatar;
  if (isPhotoAvatar(avatar)) return avatar;
  if (avatar.startsWith("data:"))
    throw new Error(
      "That photo is too large or isn't a JPEG. Try another picture.",
    );
  return "seed:0";
}
