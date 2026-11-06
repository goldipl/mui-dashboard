import { useContext } from 'react';
import { NewsroomContext, type NewsroomContextValue } from './context';

/** Access to the newsroom state and actions. Must be used inside `<NewsroomProvider>`. */
export function useNewsroom(): NewsroomContextValue {
  const context = useContext(NewsroomContext);
  if (!context) throw new Error('useNewsroom must be used within <NewsroomProvider>');
  return context;
}
