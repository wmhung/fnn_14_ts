import { UserRoleProvider } from './contexts/UserRoleContext';
import { PlaceProvider } from './contexts/PlaceContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { LocationProvider } from './contexts/LocationContext';

export default function AppProviders({ children }) {
  return (
    <UserRoleProvider>
      <PlaceProvider>
        <BookmarkProvider>
          <LocationProvider>{children}</LocationProvider>
        </BookmarkProvider>
      </PlaceProvider>
    </UserRoleProvider>
  );
}
