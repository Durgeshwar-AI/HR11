import { useState, useRef, useCallback } from "react";

/**
 * useDragSort
 * HTML5 drag-and-drop hook for reordering a list in place.
 *
 * @param {Function} setItems — React state setter for the list being sorted
 * @returns drag event handlers + current dragIdx + current overIdx
 *
 * Usage:
 *   const drag = useDragSort(setPipeline);
 *
 *   <div
 *     draggable
 *     onDragStart={e => drag.onDragStart(e, index)}
 *     onDragEnter={e => drag.onDragEnter(e, index)}
 *     onDragOver={drag.onDragOver}
 *     onDrop={e => drag.onDrop(e, index)}
 *     onDragEnd={drag.onDragEnd}
 *   />
 */
export function useDragSort(setItems) {
  const draggingIdx = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  /** Called when the user starts dragging an item */
  const onDragStart = useCallback((e, idx) => {
    draggingIdx.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  /** Called when a dragged item enters another item's zone */
  const onDragEnter = useCallback((e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  /** Required to allow drops — just prevents default */
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  /** Called when the item is dropped onto a target */
  const onDrop = useCallback((e, idx) => {
    e.preventDefault();
    const from = draggingIdx.current;

    // No-op if same position or nothing being dragged
    if (from === null || from === idx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });

    draggingIdx.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, [setItems]);

  /** Clean up state when drag ends (even without a valid drop) */
  const onDragEnd = useCallback(() => {
    draggingIdx.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  return {
    onDragStart,
    onDragEnter,
    onDragOver,
    onDrop,
    onDragEnd,
    dragIdx,   // index currently being dragged (or null)
    overIdx,   // index currently being hovered over (or null)
  };
}
