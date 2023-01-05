import { useDragDrop } from "@heswell/salt-lab";
import {
  MouseEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type MousePos = {
  clientX: number;
  clientY: number;
  idx: string;
};

export const useDraggableColumn = ({
  onDrop,
  tableContainerRef,
  tableLayout: tableLayoutProp,
}) => {
  const [tableLayout, setTableLayout] = useState(tableLayoutProp);
  const mousePosRef = useRef<MousePos>();

  const handleDropSettle = useCallback(() => {
    console.log(`handleDropSettle`);
    mousePosRef.current = undefined;
    setTableLayout("row");
  }, []);

  const { draggable, draggedItemIndex, onMouseDown } = useDragDrop({
    allowDragDrop: true,
    draggableClassName: "table-column",
    orientation: "horizontal",
    containerRef: tableContainerRef,
    itemQuery: ".vuuDataTable-table",
    onDrop,
    onDropSettle: handleDropSettle,
  });

  const handleHeaderCellDragStart = useCallback((evt: MouseEvent) => {
    const { clientX, clientY } = evt;
    const sourceElement = evt.target as HTMLElement;
    console.log({ sourceElement });
    const thElement = sourceElement.closest(".vuuTable-headerCell");
    const {
      dataset: { idx = "-1" },
    } = thElement as HTMLElement;
    mousePosRef.current = {
      clientX,
      clientY,
      idx,
    };
    setTableLayout("column");
  }, []);

  useLayoutEffect(() => {
    console.log(
      `useDraggableColumn useLayoutEffect tableLayout ${tableLayout}`,
      {
        mousePosRef: mousePosRef.current,
      }
    );
    if (tableLayout === "column" && mousePosRef.current && !draggable) {
      const { clientX, clientY, idx } = mousePosRef.current;
      const target = tableContainerRef.current?.querySelector(
        `.vuuDataTable-table[data-idx="${idx}"]`
      ) as HTMLElement;
      if (target) {
        const evt = {
          persist: () => undefined,
          nativeEvent: {
            clientX,
            clientY,
            target,
          },
        };
        onMouseDown?.(evt as unknown as MouseEvent);
      }
    }
  }, [draggable, onMouseDown, tableContainerRef, tableLayout]);

  return {
    draggable,
    draggedItemIndex,
    tableLayout,
    handleHeaderCellDragStart,
  };
};
