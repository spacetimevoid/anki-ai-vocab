/**
 * Position Calculator & Viewport Collision Detection Engine
 * Computes optimal non-blocking coordinates for Compact Floating Popover
 */

export const POPOVER_WIDTH = 375;
export const ESTIMATED_POPOVER_HEIGHT = 420;
export const OFFSET_GAP = 8;
export const VIEWPORT_MARGIN = 12;

/**
 * Calculates optimal absolute coordinates (top, left) for popover
 * Prevents viewport clipping by flipping vertically or clamping horizontally
 *
 * @param {DOMRect} targetRect - Bounding rect of the text selection range
 * @param {number} customHeight - Optional actual height of popover element if already rendered
 * @returns {{ top: number, left: number, placement: 'top' | 'bottom' }}
 */
export function calculatePopoverPosition(targetRect, customHeight = ESTIMATED_POPOVER_HEIGHT) {
  if (!targetRect) {
    return { top: 100, left: 100, placement: 'bottom' };
  }

  const popoverHeight = Math.min(customHeight || ESTIMATED_POPOVER_HEIGHT, 460);
  const popoverWidth = POPOVER_WIDTH;

  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Space check in viewport coordinates
  const spaceBelow = viewportHeight - targetRect.bottom;
  const spaceAbove = targetRect.top;

  let top = 0;
  let placement = 'bottom';

  // 1. Vertical Positioning: Strictly prioritize displaying BELOW the selected word (top = rect.bottom + window.scrollY + 8).
  // ONLY flip to top if space below is virtually zero (< 160px) AND there is significantly more space above (> 260px).
  if (spaceBelow < 160 && spaceAbove > 260 && spaceAbove > spaceBelow) {
    top = targetRect.top + scrollY - popoverHeight - 8;
    placement = 'top';
  } else {
    top = targetRect.bottom + scrollY + 8;
    placement = 'bottom';
  }

  // 2. Horizontal Positioning & Viewport Clamping
  // Center horizontally relative to target selection range
  let left = targetRect.left + scrollX + (targetRect.width / 2) - (popoverWidth / 2);

  // Clamp within viewport boundaries
  const minLeft = scrollX + VIEWPORT_MARGIN;
  const maxLeft = scrollX + viewportWidth - popoverWidth - VIEWPORT_MARGIN;

  if (left < minLeft) {
    left = minLeft;
  } else if (left > maxLeft) {
    left = Math.max(minLeft, maxLeft);
  }

  return {
    top: Math.round(top),
    left: Math.round(left),
    placement
  };
}

