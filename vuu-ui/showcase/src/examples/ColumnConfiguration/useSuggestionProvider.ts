import { SchemaColumn, useTypeaheadSuggestions } from "@finos/vuu-data";
import {
  ColumnExpressionSuggestionType,
  ISuggestionProvider2,
  SuggestionType,
} from "@finos/vuu-filters";
import { TypeaheadParams, VuuTable } from "@finos/vuu-protocol-types";
import { useCallback, useRef } from "react";
import { Completion } from "@codemirror/autocomplete";

const withApplySpace = (suggestions: Completion[]): Completion[] =>
  suggestions.map((suggestion) => ({
    ...suggestion,
    apply: suggestion.label + " ",
  }));

const tableColumns: Completion[] = [
  { label: "bbg", boost: 5 },
  { label: "description", boost: 5 },
  { label: "currency", boost: 5 },
  { label: "exchange", boost: 5 },
  { label: "lotSize", boost: 5 },
  { label: "isin", boost: 5 },
  { label: "ric", boost: 5 },
];

const functions: Completion[] = [
  {
    label: "concatenate",
    apply: "concatenate( ",
    boost: 2,
    type: "function",
  },
  {
    label: "max",
    apply: "max( ",
    boost: 2,
    type: "function",
  },
  {
    label: "min",
    apply: "min( ",
    boost: 2,
    type: "function",
  },
  {
    label: "text",
    apply: "text( ",
    boost: 2,
    type: "function",
  },
  {
    label: "right",
    apply: "right( ",
    boost: 2,
    type: "function",
  },
  {
    label: "left",
    apply: "left( ",
    boost: 2,
    type: "function",
  },
];

const expressions = withApplySpace(tableColumns).concat(functions);

const doneCommand: Completion = {
  label: "Done",
  apply: "] ",
  type: "keyword",
  boost: 10,
};

const toSuggestions = (
  values: string[],
  quoted = false,
  prefix = ""
): Completion[] => {
  const quote = quoted ? '"' : "";
  return values.map((value) => ({
    label: value,
    apply: `${prefix}${quote}${value}${quote} `,
  }));
};

const getTypeaheadParams = (
  table: VuuTable,
  column: string,
  text = "",
  selectedValues: string[] = []
): TypeaheadParams => {
  if (text !== "" && !selectedValues.includes(text.toLowerCase())) {
    return [table, column, text];
  } else {
    return [table, column];
  }
};

export interface SuggestionProviderHookProps {
  columns: SchemaColumn[];
  table: VuuTable;
}

export const useSuggestionProvider = ({
  columns,
  table,
}: SuggestionProviderHookProps): ISuggestionProvider2 => {
  const latestSuggestionsRef = useRef<Completion[]>();
  const getTypeaheadSuggestions = useTypeaheadSuggestions();
  const getSuggestions = useCallback(
    async (
      valueType: ColumnExpressionSuggestionType,
      columnName?: string,
      startsWith?: string,
      selection?: string[]
    ): Promise<Completion[]> => {
      // console.log("getSuggestions, using ", {
      //   valueType,
      //   columnName,
      //   startsWith,
      //   columns,
      //   getTypeaheadSuggestions,
      //   table,
      //   selection,
      // });

      if (valueType === "expression") {
        const suggestions = await expressions;
        return (latestSuggestionsRef.current = suggestions);
      } else if (valueType === "column") {
        const suggestions = await tableColumns;
        return (latestSuggestionsRef.current = withApplySpace(suggestions));
      } else if (columnName) {
        const column = columns.find((col) => col.name === columnName);
        const prefix = Array.isArray(selection)
          ? selection.length === 0
            ? "["
            : ","
          : "";
        const params = getTypeaheadParams(table, columnName, startsWith);
        const suggestions = await getTypeaheadSuggestions(params);
        // prob don;t want to save the preix
        latestSuggestionsRef.current = toSuggestions(
          suggestions,
          column?.serverDataType === "string",
          prefix
        );
        if (Array.isArray(selection) && selection?.length > 1) {
          return [doneCommand, ...latestSuggestionsRef.current];
        } else {
          return latestSuggestionsRef.current;
        }
      }

      return [];
    },
    [columns, getTypeaheadSuggestions, table]
  );

  const isPartialMatch = useCallback(
    async (
      valueType: SuggestionType,
      columnName?: string,
      pattern?: string
    ) => {
      const { current: latestSuggestions } = latestSuggestionsRef;
      let maybe = false;
      const suggestions =
        latestSuggestions ||
        (await getSuggestions(valueType, columnName, pattern));
      if (pattern && suggestions) {
        for (const option of suggestions) {
          if (option.label === pattern) {
            return false;
          } else if (option.label.startsWith(pattern)) {
            maybe = true;
          }
        }
      }
      return maybe;
    },
    [getSuggestions]
  );

  return {
    getSuggestions,
    isPartialMatch,
  };
};
