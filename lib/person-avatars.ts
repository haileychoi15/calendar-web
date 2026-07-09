/** Default avatar for people without a mapped profile photo. */
export const DEFAULT_PERSON_AVATAR_SRC = "/avatars/user.png";

const PERSON_AVATAR_SRC_BY_NAME = {
  김민준: "/avatars/김민준.png",
  최유영: "/avatars/최유영.png",
  박준호: "/avatars/박준호.png",
  최지훈: "/avatars/최지훈.png",
  정하은: "/avatars/정하은.png",
  강유진: "/avatars/강유진.png",
} as const;

export type MappedPersonName = keyof typeof PERSON_AVATAR_SRC_BY_NAME;

export function getPersonAvatarSrc(name: string) {
  return (
    PERSON_AVATAR_SRC_BY_NAME[name as MappedPersonName] ??
    DEFAULT_PERSON_AVATAR_SRC
  );
}
