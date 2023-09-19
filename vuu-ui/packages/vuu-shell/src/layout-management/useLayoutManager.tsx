import React, { useState, useCallback, useContext, useEffect } from "react";
import { getLocalEntity } from "@finos/vuu-filters";
import { LayoutJSON, LocalLayoutPersistenceManager } from "@finos/vuu-layout";
import { LayoutMetadata, Layout } from "./layoutTypes";

const persistenceManager = new LocalLayoutPersistenceManager();

export const LayoutManagementContext = React.createContext<{
  layouts: Layout[],
  layoutMetadata: LayoutMetadata[],
  saveLayout: (n: Omit<LayoutMetadata, "id">) => void
}>({ layouts: [], layoutMetadata: [], saveLayout: () => { } })

export const LayoutManagementProvider = (props: {
    children: JSX.Element | JSX.Element[]
  }) => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [layoutMetadata, setLayoutMetadata] = useState<LayoutMetadata[]>([]);

  useEffect(() => {
    const loadedLayouts = persistenceManager.loadLayouts();
    setLayouts(loadedLayouts || [])
  }, [])

  const saveLayout = useCallback((metadata: Omit<LayoutMetadata, "id">) => {
    const json = getLocalEntity<LayoutJSON>("api/vui");

    if (json) {
      // Persist layouts
      const generatedId = persistenceManager.saveLayout(metadata, json);

      // Update state
      const newMetadata = {
        ...metadata,
        id: generatedId
      };

      const newLayout = {
        json: json,
        id: generatedId
      };

      setLayouts(prev => [...prev, newLayout]);
      setLayoutMetadata(prev => [...prev, newMetadata]);
    }
  }, [])

  return (
    <LayoutManagementContext.Provider value={{ layouts, layoutMetadata, saveLayout }} >
      {props.children}
    </LayoutManagementContext.Provider>
  )
}

export const useLayoutManager = () => useContext(LayoutManagementContext);
