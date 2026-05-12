/**
 * Math-backed bonus (free-spin) book pool for Storybook.
 *
 * Bonus-mode books require the freegame distribution (force_freegame=True)
 * which needs scatter triggers. FS books are not yet auto-generated.
 * Use golden_base_book for full base+FS sequences in the meantime.
 *
 * To regenerate: update run_fixtures.py to include bonus criteria
 * once the freegame trigger performance issue is resolved on your hardware.
 */
export default [] as { gameType: string; events: object[] }[];
