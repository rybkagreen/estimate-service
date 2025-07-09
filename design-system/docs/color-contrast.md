# Color Contrast Guide - WCAG 2.1 AA Compliance

## Overview
This document outlines the contrast ratios for our design system color palette to ensure WCAG 2.1 AA compliance.

## WCAG 2.1 AA Requirements
- **Normal text**: Minimum contrast ratio of 4.5:1
- **Large text** (18pt+ or 14pt+ bold): Minimum contrast ratio of 3:1
- **UI components**: Minimum contrast ratio of 3:1

## Light Theme Contrast Ratios

### Text on Background
| Text Color | Background | Contrast Ratio | WCAG AA |
|------------|------------|----------------|---------|
| Text Primary (rgba(0,0,0,0.87)) | White (#fff) | 16.12:1 | ✅ Pass |
| Text Secondary (rgba(0,0,0,0.60)) | White (#fff) | 7.43:1 | ✅ Pass |
| Text Disabled (rgba(0,0,0,0.38)) | White (#fff) | 3.54:1 | ❌ Fail (use only for disabled states) |

### Primary Colors on White
| Color | Hex | Contrast on White | Usage |
|-------|-----|-------------------|--------|
| Primary 500 | #2196f3 | 3.13:1 | ⚠️ Large text only |
| Primary 600 | #1e88e5 | 3.54:1 | ⚠️ Large text only |
| Primary 700 | #1976d2 | 4.17:1 | ⚠️ Close to AA |
| Primary 800 | #1565c0 | 4.92:1 | ✅ Normal text |
| Primary 900 | #0d47a1 | 7.14:1 | ✅ Normal text |

### Semantic Colors
| Color | Usage | Contrast on White | WCAG AA |
|-------|-------|-------------------|---------|
| Success Main (#2e7d32) | Normal text | 4.89:1 | ✅ Pass |
| Warning Main (#ed6c02) | Large text | 3.09:1 | ✅ Pass (large text) |
| Error Main (#d32f2f) | Normal text | 4.59:1 | ✅ Pass |
| Info Main (#0288d1) | Normal text | 4.52:1 | ✅ Pass |

## Dark Theme Contrast Ratios

### Text on Background
| Text Color | Background | Contrast Ratio | WCAG AA |
|------------|------------|----------------|---------|
| Text Primary (rgba(255,255,255,0.87)) | Dark (#121212) | 13.51:1 | ✅ Pass |
| Text Secondary (rgba(255,255,255,0.60)) | Dark (#121212) | 6.23:1 | ✅ Pass |

### Primary Colors on Dark
| Color | Hex | Contrast on #121212 | Usage |
|-------|-----|---------------------|--------|
| Primary 500 (dark) | #42a5f5 | 7.84:1 | ✅ Normal text |
| Primary 600 (dark) | #64b5f6 | 9.31:1 | ✅ Normal text |

## Best Practices

### Do's ✅
1. Use Primary 800-900 for normal text on white backgrounds
2. Use white text on Primary 500-900 backgrounds
3. Test all color combinations before implementation
4. Use semantic colors for their intended purpose

### Don'ts ❌
1. Don't use light primary colors (300-500) for normal text on white
2. Don't use disabled text color for important information
3. Don't rely on color alone to convey information

## Color Combination Matrix

### Safe Combinations for Normal Text
- ✅ Black/Dark gray on white/light backgrounds
- ✅ White on primary 500+ colors
- ✅ White on semantic colors (success, error, warning, info)
- ✅ Primary 800-900 on white

### Safe Combinations for Large Text
- ✅ Primary 600+ on white
- ✅ All semantic colors on white
- ✅ Gray 600+ on white

## Testing Tools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Accessibility Inspector
- Stark (Figma/Sketch plugin)

## Implementation Notes
1. Always test color combinations in both light and dark themes
2. Consider users with color blindness - don't rely solely on color
3. Provide additional visual cues (icons, patterns, text labels)
4. Test with real content, not just color swatches
