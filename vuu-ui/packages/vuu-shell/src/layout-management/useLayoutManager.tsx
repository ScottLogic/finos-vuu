import React, { useState, useCallback, useContext, useEffect } from "react";
import { getLocalEntity } from "@finos/vuu-filters";
import { LayoutJSON, LayoutPersistenceManager } from "@finos/vuu-layout";
import { LayoutMetadata, Layout } from "./layoutTypes";

export const LayoutManagementContext = React.createContext<{
  layouts: Layout[],
  saveLayout: (n: LayoutMetadata) => void
}>({ layouts: [], saveLayout: () => { } })

export const LayoutManagementProvider = (props: {
    persistenceManager: LayoutPersistenceManager,
    children: JSX.Element | JSX.Element[]
  }) => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [layout, setLayout] = useState<LayoutJSON>();
  const [metadata, setMetadata] = useState<LayoutMetadata>();

  useEffect(() => {
    const loadedLayouts = props.persistenceManager.loadLayouts();
    setLayouts(loadedLayouts || [])
  }, [])

  useEffect(() => {
    if (layout && metadata) {
      // Persist layouts
      const generatedId = props.persistenceManager.saveLayout(metadata, layout);

      // Update state
      const newLayout = {
        json: layout,
        metadata: metadata,
        id: generatedId
      } as Layout;

      setLayouts(prev => [...prev, newLayout]);
    }
  }, [layout, metadata])

  const saveLayout = useCallback((metadata: LayoutMetadata) => {
    const json = getLocalEntity<LayoutJSON>("api/vui");
    if (json) {
      setLayout(json);
      setMetadata(metadata);
    }
  }, [])

  return (
    <LayoutManagementContext.Provider value={{ layouts, saveLayout }} >
      {props.children}
    </LayoutManagementContext.Provider>
  )
}

export const useLayoutManager = () => useContext(LayoutManagementContext);
