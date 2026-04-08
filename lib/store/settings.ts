// settings.ts — re-exports from the unified store (lib/store/index.ts)
// Kept for backward compatibility with any old imports
export { useSettingsStore } from './index'

// Dummy exports so old SettingsProvider doesn't crash if somehow imported
export const COLOR_SCHEMES = {}
export const FONT_FAMILIES = {}
