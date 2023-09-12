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
  const [tempLayouts, setTempLayouts] = useState<Layout[]>([]);

  useEffect(() => {
    const loadedLayouts = props.persistenceManager.loadLayouts();
    setLayouts(loadedLayouts || [])
  }, [])

  useEffect(() => {
    if (tempLayouts.length !== 0) {
      // Persist layouts
      const generatedId = props.persistenceManager.saveLayout([...layouts, ...tempLayouts]);

      // Update state
      const newLayout = tempLayouts[0];
      newLayout.metadata.id = generatedId;
      setLayouts(prev => [...prev, newLayout]);
    }
  }, [tempLayouts])

  const saveLayout = useCallback((metadata: Omit<LayoutMetadata, "id">) => {
    const json = getLocalEntity<LayoutJSON>("api/vui");
    if (json) {
      setTempLayouts([...layouts, { metadata: { ...metadata, id: "" }, json }])
    }
  }, [])

  return (
    <LayoutManagementContext.Provider value={{ layouts, saveLayout }} >
      {props.children}
    </LayoutManagementContext.Provider>
  )
}

export const useLayoutManager = () => useContext(LayoutManagementContext);
