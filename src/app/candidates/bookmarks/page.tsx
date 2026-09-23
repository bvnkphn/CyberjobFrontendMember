import AppShell from "@/components/layout/AppShell";
import { BookmarkedCandidatesView } from "@/components/candidates/BookmarkedCandidatesView";

export default function BookmarkedCandidatesPage() {
  return (
    <AppShell titleKey="pageTitle.bookmarks">
      <BookmarkedCandidatesView />
    </AppShell>
  );
}
