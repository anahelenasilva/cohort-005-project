import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraftInput = {
  /** What is in the box right now. */
  draft: string;
  /** The body last saved on the server, or null when there is no Note yet. */
  savedBody: string | null;
  saving: boolean;
  error: string | undefined;
};

export type NoteStatus = "saving" | "error" | "unsaved" | "saved" | "blank";

export type NoteDraft = {
  length: number;
  max: number;
  tooLong: boolean;
  canSave: boolean;
  status: NoteStatus;
};

export function describeDraft({
  draft,
  savedBody,
  saving,
  error,
}: NoteDraftInput): NoteDraft {
  // The server trims before it measures and stores, so the box does the same:
  // trailing whitespace is neither a change nor a character over the limit.
  const trimmed = draft.trim();
  const length = trimmed.length;
  const tooLong = length > MAX_NOTE_LENGTH;
  const changed = trimmed !== (savedBody ?? "");

  return {
    length,
    max: MAX_NOTE_LENGTH,
    tooLong,
    canSave: !saving && changed && length > 0 && !tooLong,
    status: statusOf({ saving, error, changed, savedBody }),
  };
}

function statusOf({
  saving,
  error,
  changed,
  savedBody,
}: {
  saving: boolean;
  error: string | undefined;
  changed: boolean;
  savedBody: string | null;
}): NoteStatus {
  if (saving) return "saving";
  if (error) return "error";
  if (changed) return "unsaved";
  if (savedBody !== null) return "saved";
  return "blank";
}
