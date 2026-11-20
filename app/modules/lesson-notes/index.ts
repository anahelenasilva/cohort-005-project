export type { NoteDraft, NoteDraftInput, NoteStatus } from "./lib/draft";
import {
  describeDraft,
  type NoteDraft,
  type NoteDraftInput,
} from "./lib/draft";

/**
 * What the Note editor on the Lesson page should show for the text in the box:
 * the character count against the limit, whether Save is allowed, and which
 * status line to show beside it.
 */
export function describeNoteDraft(input: NoteDraftInput): NoteDraft {
  return describeDraft(input);
}
