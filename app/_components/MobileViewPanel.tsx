'use client';

import ParkLists from './ParkLists';
import BookmarkList from './BookmarkList';

function MobileViewPanel({ mobileView }) {
  return (
    <div className="mt-4 px-4">
      {mobileView === 'list' && (
        <div className="animate-slide-in">
          <ParkLists />
        </div>
      )}
      {mobileView === 'bookmarks' && (
        <div className="animate-slide-in">
          <BookmarkList />
        </div>
      )}
    </div>
  );
}

export default MobileViewPanel;