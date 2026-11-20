import { describe, expect, it } from "vitest";
import { describeNoteDraft, type NoteDraftInput } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

function draft(overrides: Partial<NoteDraftInput>) {
  return describeNoteDraft({
    draft: "",
    savedBody: null,
    saving: false,
    error: undefined,
    ...overrides,
  });
}

describe("describeNoteDraft", () => {
  it("is blank, and cannot be saved, before the Student writes anything", () => {
    expect(draft({})).toEqual({
      length: 0,
      max: MAX_NOTE_LENGTH,
      tooLong: false,
      canSave: false,
      status: "blank",
    });
  });

  it("cannot save a box of only whitespace", () => {
    const result = draft({ draft: "   \n " });
    expect(result.canSave).toBe(false);
    expect(result.length).toBe(0);
    expect(result.status).toBe("blank");
  });

  it("offers Save, and says so, once the Student types a new Note", () => {
    const result = draft({ draft: "Generics are like function arguments" });
    expect(result.canSave).toBe(true);
    expect(result.status).toBe("unsaved");
    expect(result.length).toBe(36);
  });

  it("counts the text the server will store, without surrounding whitespace", () => {
    expect(draft({ draft: "  abc  \n" }).length).toBe(3);
  });

  it("shows a saved Note as saved, with nothing to save", () => {
    const result = draft({ draft: "kept", savedBody: "kept" });
    expect(result.status).toBe("saved");
    expect(result.canSave).toBe(false);
  });

  it("does not treat trailing whitespace as a change to a saved Note", () => {
    const result = draft({ draft: "kept  \n", savedBody: "kept" });
    expect(result.status).toBe("saved");
    expect(result.canSave).toBe(false);
  });

  it("marks an edit to a saved Note as unsaved", () => {
    const result = draft({ draft: "kept, and more", savedBody: "kept" });
    expect(result.status).toBe("unsaved");
    expect(result.canSave).toBe(true);
  });

  it("allows a Note of exactly the limit", () => {
    const result = draft({ draft: "a".repeat(MAX_NOTE_LENGTH) });
    expect(result.tooLong).toBe(false);
    expect(result.canSave).toBe(true);
  });

  it("refuses a Note one character over the limit", () => {
    const result = draft({ draft: "a".repeat(MAX_NOTE_LENGTH + 1) });
    expect(result.tooLong).toBe(true);
    expect(result.canSave).toBe(false);
    expect(result.length).toBe(MAX_NOTE_LENGTH + 1);
  });

  it("is saving, and cannot be saved again, while a save is in flight", () => {
    const result = draft({ draft: "new", savedBody: "old", saving: true });
    expect(result.status).toBe("saving");
    expect(result.canSave).toBe(false);
  });

  it("shows the server's error rather than unsaved", () => {
    const result = draft({ draft: "new", error: "Nope" });
    expect(result.status).toBe("error");
    expect(result.canSave).toBe(true);
  });

  it("shows saving over an earlier error", () => {
    expect(draft({ draft: "new", error: "Nope", saving: true }).status).toBe(
      "saving"
    );
  });

  it("treats clearing a saved Note as an unsaved change that cannot be saved", () => {
    const result = draft({ draft: "", savedBody: "kept" });
    expect(result.status).toBe("unsaved");
    expect(result.canSave).toBe(false);
  });
});
