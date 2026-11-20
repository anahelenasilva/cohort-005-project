import { useState } from "react";
import { useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { LessonPanel } from "~/components/lesson-panel";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import {
  describeNoteDraft,
  type NoteDraft,
  type NoteStatus,
} from "~/modules/lesson-notes";

export function LessonNote({
  note,
}: {
  note: { body: string; updatedAt: string } | null;
}) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const error = fetcher.data?.error;
  const draft = describeNoteDraft({
    draft: body,
    savedBody: note?.body ?? null,
    saving: fetcher.state !== "idle",
    error,
  });

  return (
    <LessonPanel
      icon={NotebookPen}
      title="Your notes"
      description="Jot down what you want to remember from this lesson."
      aside={<PrivateBadge />}
    >
      <fetcher.Form method="post" className="space-y-2">
        <input type="hidden" name="intent" value="save-note" />
        <Textarea
          name="body"
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What stood out? What do you want to try later?"
          aria-label="Your notes"
          className="resize-y"
        />
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={!draft.canSave}>
            {draft.status === "saving" ? "Saving..." : "Save note"}
          </Button>
          <NoteStatusLine
            status={draft.status}
            error={error}
            updatedAt={note?.updatedAt}
          />
          <CharacterCount draft={draft} />
        </div>
      </fetcher.Form>
    </LessonPanel>
  );
}

function NoteStatusLine({
  status,
  error,
  updatedAt,
}: {
  status: NoteStatus;
  error: string | undefined;
  updatedAt: string | undefined;
}) {
  if (status === "error") {
    return <span className="text-sm text-destructive">{error}</span>;
  }
  if (status === "unsaved") {
    return (
      <span className="text-xs text-muted-foreground">Unsaved changes</span>
    );
  }
  if (status === "saved" && updatedAt) {
    return (
      <span suppressHydrationWarning className="text-xs text-muted-foreground">
        Saved · last edited {formatRelativeTime(updatedAt)}
      </span>
    );
  }
  return null;
}

function PrivateBadge() {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Lock className="size-3" />
      Only you can see this
    </span>
  );
}

function CharacterCount({ draft }: { draft: NoteDraft }) {
  return (
    <span
      className={cn(
        "ml-auto text-xs",
        draft.tooLong ? "text-destructive" : "text-muted-foreground"
      )}
    >
      {draft.length} / {draft.max}
    </span>
  );
}
