import React, { useState, useCallback, useContext, useEffect } from "react";
import { getLocalEntity } from "@finos/vuu-filters";
import { LayoutJSON, LocalLayoutPersistenceManager, defaultLayout } from "@finos/vuu-layout";
import { LayoutMetadata } from "./layoutTypes";

const saveLocation = process.env.location || "local"
// TODO: pick remote based on save location

const persistenceManager = new LocalLayoutPersistenceManager();

export const LayoutManagementContext = React.createContext<{
  layoutMetadata: LayoutMetadata[],
  saveLayout: (n: Omit<LayoutMetadata, "id">) => void,
  tempLayout: LayoutJSON,
  saveTempLayout: (layout: LayoutJSON) => void,
  loadLayoutById: (id: string) => LayoutJSON
}>({
  layoutMetadata: [],
  saveLayout: () => { },
  tempLayout: defaultLayout,
  saveTempLayout: () => { },
  loadLayoutById: () => defaultLayout

})

export const LayoutManagementProvider = (props: {
  children: JSX.Element | JSX.Element[]
}) => {
  const [layoutMetadata, setLayoutMetadata] = useState<LayoutMetadata[]>([]);
  const [tempLayout, setTempLayout] = useState<LayoutJSON>(defaultLayout);

  useEffect(() => {
    const loadedMetadata = persistenceManager.loadMetadata();
    const temp = persistenceManager.loadTempLayout();

    setLayoutMetadata(loadedMetadata || [])
    setTempLayout(temp);
  }, [])

  const saveTempLayout = useCallback((layout: LayoutJSON) => {
    persistenceManager.saveTempLayout(layout)
  }, []);

  const saveLayout = useCallback((metadata: Omit<LayoutMetadata, "id">) => {
    const json = getLocalEntity<LayoutJSON>("api/vui");

    if (json) {
      // Persist layouts
      const generatedId = persistenceManager.saveLayout(metadata, json);

      // Update state
      const newMetadata: LayoutMetadata = {
        ...metadata,
        id: generatedId
      };

      setLayoutMetadata(prev => [...prev, newMetadata]);
    }
  }, [])

  const loadLayoutById = useCallback((id) => persistenceManager.loadLayout(id), []);

  return (
    <LayoutManagementContext.Provider value={{ layoutMetadata, saveLayout, tempLayout, saveTempLayout, loadLayoutById }} >
      {props.children}
    </LayoutManagementContext.Provider>
  )
}

export const useLayoutManager = () => useContext(LayoutManagementContext);
