//TODO this all probably belongs in vuu-table
import type { DataSourceRow } from "@finos/vuu-data-types";
import type { MutableRefObject } from "react";
import { metadataKeys } from "./column-utils";

const { IDX } = metadataKeys;

export type RowOffsetFunc = (
  row: DataSourceRow,
  pctScrollTop?: number
) => number;
export type RowAtPositionFunc = (position: number) => number;

/**
 * RowOffset function, RowAtPosition function, isVirtualScroll
 */
export type RowPositioning = [RowOffsetFunc, RowAtPositionFunc, boolean];

export const actualRowPositioning = (rowHeight: number): RowPositioning => [
  (row) => row[IDX] * rowHeight,
  (position) => Math.floor(position / rowHeight),
  false,
];

/**
 * return functions for determining a) the pixel offset to apply to a row, given the
 * row index and b) the index of the row at a given scroll offset. This implementation
 * is used when we are forced to 'virtualise' scrolling - because the number of rows
 * is high enough that we cannot create a large enough HTML content container.
 *
 * @param rowHeight
 * @param virtualisedExtent
 * @param pctScrollTop
 * @returns
 */
export const virtualRowPositioning = (
  rowHeight: number,
  virtualisedExtent: number,
  pctScrollTop: MutableRefObject<number>
): RowPositioning => [
  (row) => {
    const rowOffset = pctScrollTop.current * virtualisedExtent;
    return row[IDX] * rowHeight - rowOffset;
  },
  /*
    Return index position of closest row 
  */
  (position) => {
    const rowOffset = pctScrollTop.current * virtualisedExtent;
    return Math.round((position + rowOffset) / rowHeight);
  },
  true,
];

export const getRowElementAtIndex = (
  container: HTMLDivElement,
  rowIndex: number
) => {
  if (rowIndex === -1) {
    return null;
  } else {
    const activeRow = container.querySelector(
      `[aria-rowindex="${rowIndex + 1}"]`
    ) as HTMLElement;

    if (activeRow) {
      return activeRow;
    } else {
      throw Error(
        `getRowElementAtIndex no row found for index index ${rowIndex}`
      );
    }
  }
};

export const getIndexFromRowElement = (rowElement: HTMLElement) => {
  const rowIndex = rowElement.ariaRowIndex;
  if (rowIndex != null) {
    const index = parseInt(rowIndex) - 1;
    if (!isNaN(index)) {
      return index;
    } else {
      throw Error(
        `getIndexFromRowElement row element aria rowindex invalid ${rowIndex}`
      );
    }
  } else {
    throw Error(
      "getIndexFromRowElement row element does not have aria rowindex"
    );
  }
};
