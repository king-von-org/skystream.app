export interface MyListItem {
  id: string;
  title: string;
  posterPath: string;
  backdropPath?: string;
  rating?: number;
  year?: string | number;
  type: string;
  overview?: string;
}

const KEY = 'skyplus_mylist';

export function getMyList(): MyListItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function addToMyList(item: MyListItem): void {
  const list = getMyList();
  if (!list.find(i => i.id === item.id)) {
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function removeFromMyList(id: string, type: string): void {
  localStorage.setItem(KEY, JSON.stringify(getMyList().filter(i => i.id !== id)));
}

export function isInMyList(id: string | number, type: string): boolean {
  return getMyList().some(i => i.id === String(id));
}
