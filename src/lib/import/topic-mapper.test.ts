import { describe, it, expect } from "vitest";
import { mapQuestionToTopicSlug } from "./topic-mapper";

describe("mapQuestionToTopicSlug", () => {
  it("maps a coalesce question to importing-data by keyword, not the study-guide bucket", () => {
    const slug = mapQuestionToTopicSlug({
      questionText: "When importing data, what does coalesce a field mean?",
      explanation: "",
      options: [],
      studyGuideBuckets: ["Import Sets & Transform/Coalesce"],
    });
    expect(slug).toBe("importing-data");
  });

  it("maps an ACL question to access-control", () => {
    const slug = mapQuestionToTopicSlug({
      questionText: "Which ACL operation allows users to insert new records into a table?",
      explanation: "",
      options: [],
      studyGuideBuckets: ["ACLs & Security Model"],
    });
    expect(slug).toBe("access-control");
  });

  it("falls back to the study-guide bucket mapping when no keyword rule matches", () => {
    const slug = mapQuestionToTopicSlug({
      questionText: "Something with no obvious keyword at all.",
      explanation: "",
      options: [],
      studyGuideBuckets: ["Visual Task Boards"],
    });
    expect(slug).toBe("task-management-vtb");
  });

  it("falls back to platform-overview as a last resort when nothing matches", () => {
    const slug = mapQuestionToTopicSlug({ questionText: "xyz", explanation: "", options: [], studyGuideBuckets: [] });
    expect(slug).toBe("platform-overview");
  });
});
