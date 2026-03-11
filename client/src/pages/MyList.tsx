import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Trash2, Play, ListChecks } from "lucide-react";
import { getMyList, removeFromMyList, type MyListItem } from "@/lib/mylist";

export default function MyList() {
  const [items, setItems] = useState<MyListItem[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => { setItems(getMyList()); }, []);

  function handleRemove(e: React.MouseEvent, item: MyListItem) {
    e.stopPropagation();
    removeFromMyList(item.id, item.type);
    setItems(getMyList());
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] pt-24 pb-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">My List</h1>
            <p className="text-gray-400 text-sm">{items.length} saved {items.length === 1 ? 'title' : 'titles'}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-[#1E2433] flex items-center justify-center mx-auto mb-6">
              <ListChecks className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your list is empty</h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Add movies, shows, and dramas to your list to watch them later.
            </p>
            <button
              onClick={() => navigate('/')}
              data-testid="browse-btn"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Browse Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in" data-testid="mylist-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer"
                data-testid={`mylist-item-${item.id}`}
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1E2433] mb-2 relative group-hover:scale-105 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-black/60">
                  {item.posterPath ? (
                    <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Play className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/detail/${item.id}?play=1`); }}
                      className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      data-testid={`play-mylist-${item.id}`}
                    >
                      <Play className="w-4 h-4 fill-black" />
                    </button>
                    <button
                      onClick={(e) => handleRemove(e, item)}
                      className="w-10 h-10 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      data-testid={`remove-mylist-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-white line-clamp-1">{item.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                  {item.year && <span className="text-xs text-gray-500">{String(item.year).slice(0, 4)}</span>}
                  <span className="text-xs text-gray-600">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
