'use client';

import { useParkLists } from '../_lib/hooks/useParkLists';
import Pagination from './Pagination';
import Spinner from './Spinner';

function PaginationControl() {
  const { parkLists, isLoading, count } = useParkLists();

  if (isLoading) return <Spinner />;

  // if (!parkLists.length) return null;
  return (
    <div>
      <Pagination count={count} />
    </div>
  );
}

export default PaginationControl;
