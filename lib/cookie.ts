import Cookies from 'js-cookie';

const SHORTLIST_KEY = 'scout_shortlist';

export const getShortlistCookies = (): string[] => {
  try {
    const raw = Cookies.get(SHORTLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};


export const setShortlistCookie = (shortlist: string[]): void => {
  Cookies.set(SHORTLIST_KEY, JSON.stringify(shortlist), { expires: 30 });
};

export const addPlayerToShortlistCookie = (playerName: string): string[] => {
  const list = getShortlistCookies();
  if (!list.includes(playerName)) {
    list.push(playerName);
    setShortlistCookie(list);
  }
  return list;
};

export const removePlayerFromShortlistCookie = (playerName: string): string[] => {
  const list = getShortlistCookies().filter((p) => p !== playerName);
  setShortlistCookie(list);
  return list;
};
