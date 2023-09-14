import React, { useState, useCallback, useContext, useEffect } from "react";
import { getLocalEntity } from "@finos/vuu-filters";
import { LayoutJSON, LayoutPersistenceManager } from "@finos/vuu-layout";
import { LayoutMetadata, Layout } from "./layoutTypes";

export const LayoutManagementContext = React.createContext<{
  layouts: Layout[],
  saveLayout: (n: Omit<LayoutMetadata, "id">) => void
}>({ layouts: [], saveLayout: () => { } })

export const LayoutManagementProvider = (props: {
    persistenceManager: LayoutPersistenceManager,
    children: JSX.Element | JSX.Element[]
  }) => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [tempLayout, setTempLayout] = useState<LayoutJSON>();
  const [tempMetadata, setTempMetadata] = useState<Omit<LayoutMetadata, "id">>();

  useEffect(() => {
    const loadedLayouts = props.persistenceManager.loadLayouts();
    setLayouts(loadedLayouts || [])
  }, [])

  useEffect(() => {
    if (tempLayout && tempMetadata) {
      // Persist layouts
      const generatedId = props.persistenceManager.saveLayout(tempMetadata, tempLayout);

      // Update state
      const newLayout = {
        json: tempLayout,
        metadata: {
          ...tempMetadata,
          id: generatedId
        }
      } as Layout;

      setLayouts(prev => [...prev, newLayout]);
    }
  }, [tempLayout, tempMetadata])

  const saveLayout = useCallback((metadata: Omit<LayoutMetadata, "id">) => {
    const json = getLocalEntity<LayoutJSON>("api/vui");
    if (json) {
      setTempLayout(json);
      setTempMetadata(metadata);
    }
  }, [])

  return (
    <LayoutManagementContext.Provider value={{ layouts, saveLayout }} >
      {props.children}
    </LayoutManagementContext.Provider>
  )
}

export const useLayoutManager = () => useContext(LayoutManagementContext);
