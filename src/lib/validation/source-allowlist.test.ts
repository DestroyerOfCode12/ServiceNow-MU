import { describe, it, expect } from "vitest";
import { classifySourceUrl, isOfficialSource } from "./source-allowlist";

describe("source allowlist (section 63)", () => {
  it("accepts official ServiceNow product documentation as Tier 1", () => {
    const c = classifySourceUrl("https://www.servicenow.com/docs/bundle/xanadu-platform-security/page/x.html");
    expect(c.isAllowed).toBe(true);
    expect(c.tier).toBe("TIER1");
  });

  it("accepts developer.servicenow.com as Tier 2", () => {
    const c = classifySourceUrl("https://developer.servicenow.com/dev.do#!/learn/x");
    expect(c.isAllowed).toBe(true);
    expect(c.tier).toBe("TIER2");
  });

  it("downgrades servicenow.com/community content to Tier 2 even though the host is Tier 1", () => {
    const c = classifySourceUrl("https://www.servicenow.com/community/developer-forum/some-thread/m-p/123");
    expect(c.isAllowed).toBe(true);
    expect(c.tier).toBe("TIER2");
  });

  it("rejects arbitrary third-party URLs", () => {
    expect(isOfficialSource("https://www.reddit.com/r/servicenow/comments/x")).toBe(false);
    expect(isOfficialSource("https://some-exam-dump-site.com/csa-answers")).toBe(false);
  });

  it("rejects a malformed URL without throwing", () => {
    expect(() => classifySourceUrl("not-a-url")).not.toThrow();
    expect(isOfficialSource("not-a-url")).toBe(false);
  });

  it("does not accept a lookalike host (e.g. servicenow.com.evil.com)", () => {
    expect(isOfficialSource("https://servicenow.com.evil.com/docs")).toBe(false);
  });
});
