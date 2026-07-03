'use client';

import PlaceLists from './PlaceLists';
import BookmarkList from './BookmarkList';

function MobileViewPanel({ mobileView }) {
  return (
    <div className='mt-4 px-4'>
      {mobileView === 'list' && (
        <div className='animate-slide-in'>
          <PlaceLists />
        </div>
      )}
      {mobileView === 'bookmarks' && (
        <div className='animate-slide-in'>
          <BookmarkList />
        </div>
      )}
    </div>
  );
}

export default MobileViewPanel;
