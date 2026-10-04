import { useCallback, useEffect, useState } from 'react';
import { titleOf, mediaTypeOf } from '../lib/image';

const KEY = 'routs:mylist:v1';

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

/** useMyList() — persisted My List with optimistic toggle + toast message. */
export function useMyList() {
  const [list, setList] = useState(() => read());
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // storage full/blocked — non-fatal
    }
  }, [list]);

  const isSaved = useCallback((id) => list.some((i) => i.id === id), [list]);

  const toggle = useCallback(
    (item) => {
      const saved = list.some((i) => i.id === item.id);
      if (saved) {
        setList(list.filter((i) => i.id !== item.id));
        setNotice({ message: 'Removed from My List', id: item.id });
      } else {
        setList([
          ...list,
          {
            id: item.id,
            media_type: item.media_type || mediaTypeOf(item),
            title: item.title || item.name || titleOf(item),
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            overview: item.overview,
          },
        ]);
        setNotice({ message: 'Added to My List', id: item.id });
      }
    },
    [list]
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  return { list, isSaved, toggle, notice, clearNotice };
}
