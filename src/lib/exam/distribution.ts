/**
 * Deterministic domain-weighted question distribution (spec section 9).
 *
 * Given N total exam questions and a set of domain weights (percentages that
 * should sum to ~100), returns exactly N integer slot counts, one per domain,
 * using the largest-remainder method (Hamilton apportionment): floor each
 * domain's exact share, then hand out the leftover slots one at a time to the
 * domains with the largest fractional remainder. This is the standard way to
 * turn percentages into a fixed integer total without drifting from it.
 */
export interface WeightedDomain {
  id: string;
  weightPercent: number;
}

export interface DomainSlot {
  id: string;
  slots: number;
}

export function distributeQuestions(domains: WeightedDomain[], totalQuestions: number): DomainSlot[] {
  if (domains.length === 0 || totalQuestions <= 0) return [];

  const totalWeight = domains.reduce((sum, d) => sum + d.weightPercent, 0) || 1;

  const shares = domains.map((d) => {
    const exact = (d.weightPercent / totalWeight) * totalQuestions;
    return { id: d.id, exact, floor: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  const allocated = shares.reduce((sum, s) => sum + s.floor, 0);
  let remaining = totalQuestions - allocated;

  // Hand out leftover slots to the largest remainders first; ties broken by
  // original domain order for determinism.
  const byRemainder = [...shares].sort((a, b) => b.remainder - a.remainder || domains.findIndex((d) => d.id === a.id) - domains.findIndex((d) => d.id === b.id));

  const result = new Map(shares.map((s) => [s.id, s.floor]));
  for (let i = 0; i < byRemainder.length && remaining > 0; i++, remaining--) {
    result.set(byRemainder[i].id, (result.get(byRemainder[i].id) ?? 0) + 1);
  }

  return domains.map((d) => ({ id: d.id, slots: result.get(d.id) ?? 0 }));
}

/**
 * Rebalances a target distribution against actually-available eligible
 * question counts per domain. If a domain can't fill its target slots, the
 * shortfall is redistributed to other domains proportional to their own
 * weight, so the exam still reaches `totalQuestions` when the content pool
 * allows it overall. Returns the achievable per-domain slot counts, which may
 * sum to less than `totalQuestions` if the *total* pool is insufficient.
 */
export function rebalanceForAvailability(
  target: DomainSlot[],
  available: Map<string, number>,
  domains: WeightedDomain[],
): DomainSlot[] {
  const result = new Map(target.map((t) => [t.id, Math.min(t.slots, available.get(t.id) ?? 0)]));
  let shortfall = target.reduce((sum, t) => sum + t.slots, 0) - [...result.values()].reduce((a, b) => a + b, 0);

  if (shortfall <= 0) return target.map((t) => ({ id: t.id, slots: result.get(t.id) ?? 0 }));

  // Redistribute shortfall to domains with remaining headroom, largest-weight-first.
  const byWeightDesc = [...domains].sort((a, b) => b.weightPercent - a.weightPercent);
  let guard = 0;
  while (shortfall > 0 && guard < 10_000) {
    guard++;
    let gaveAny = false;
    for (const d of byWeightDesc) {
      if (shortfall <= 0) break;
      const current = result.get(d.id) ?? 0;
      const cap = available.get(d.id) ?? 0;
      if (current < cap) {
        result.set(d.id, current + 1);
        shortfall--;
        gaveAny = true;
      }
    }
    if (!gaveAny) break; // no domain has any more headroom anywhere
  }

  return domains.map((d) => ({ id: d.id, slots: result.get(d.id) ?? 0 }));
}
