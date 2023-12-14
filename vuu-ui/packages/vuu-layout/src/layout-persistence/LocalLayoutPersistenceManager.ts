import {
  Layout,
  LayoutMetadata,
  LayoutMetadataDto,
  WithId,
} from "@finos/vuu-shell";
import {
  ApplicationJSON,
  LayoutJSON,
  LayoutPersistenceManager,
} from "@finos/vuu-layout";
import { getLocalEntity, saveLocalEntity } from "@finos/vuu-filters";
import { formatDate, getUniqueId } from "@finos/vuu-utils";

import { defaultApplicationJson } from "./defaultApplicationJson";

const metadataSaveLocation = "layouts/metadata";
const layoutsSaveLocation = "layouts/layouts";

export const LocalLayoutPersistenceManager = (
  urlKey = "api/vui"
): LayoutPersistenceManager => {

  const createLayout = (
    metadata: LayoutMetadataDto,
    layout: LayoutJSON
  ): Promise<LayoutMetadata> => {
    return new Promise((resolve) => {
      Promise.all([loadLayouts(), loadMetadata()]).then(
        ([existingLayouts, existingMetadata]) => {
          const id = getUniqueId();
          const newMetadata: LayoutMetadata = {
            ...metadata,
            id,
            created: formatDate(new Date(), "dd.mm.yyyy"),
          };

          saveLayoutsWithMetadata(
            [...existingLayouts, { id, json: layout }],
            [...existingMetadata, newMetadata]
          );
          resolve(newMetadata);
        }
      );
    });
  };

  const updateLayout = (
    id: string,
    newMetadata: LayoutMetadataDto,
    newLayout: LayoutJSON
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      validateIds(id)
        .then(() => Promise.all([loadLayouts(), loadMetadata()]))
        .then(([existingLayouts, existingMetadata]) => {
          const updatedLayouts = existingLayouts.map((layout) =>
            layout.id === id ? { ...layout, json: newLayout } : layout
          );
          const updatedMetadata = existingMetadata.map((metadata) =>
            metadata.id === id ? { ...metadata, ...newMetadata } : metadata
          );
          saveLayoutsWithMetadata(updatedLayouts, updatedMetadata);
          resolve();
        })
        .catch((e) => reject(e));
    });
  };

  const deleteLayout = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      validateIds(id)
        .then(() => Promise.all([loadLayouts(), loadMetadata()]))
        .then(([existingLayouts, existingMetadata]) => {
          const layouts = existingLayouts.filter((layout) => layout.id !== id);
          const metadata = existingMetadata.filter(
            (metadata) => metadata.id !== id
          );
          saveLayoutsWithMetadata(layouts, metadata);
          resolve();
        })
        .catch((e) => reject(e));
    });
  };

  const loadLayout = (id: string): Promise<LayoutJSON> => {
    return new Promise((resolve, reject) => {
      validateId(id, "layout")
        .then(() => loadLayouts())
        .then((existingLayouts) => {
          const foundLayout = existingLayouts.find(
            (layout) => layout.id === id
          );
          if (foundLayout) {
            resolve(foundLayout.json);
          } else {
            reject(new Error(`no layout found matching id ${id}`));
          }
        })
        .catch((e) => reject(e));
    });
  };

  const loadMetadata = (): Promise<LayoutMetadata[]> => {
    return new Promise((resolve) => {
      const metadata = getLocalEntity<LayoutMetadata[]>(metadataSaveLocation);
      resolve(metadata || []);
    });
  };

  const loadApplicationJSON = (): Promise<ApplicationJSON> => {
    return new Promise((resolve) => {
      const applicationJSON = getLocalEntity<ApplicationJSON>(urlKey);
      if (applicationJSON) {
        resolve(applicationJSON);
      } else {
        resolve(defaultApplicationJson);
      }
    });
  };

  const saveApplicationJSON = (
    applicationJSON: ApplicationJSON
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const savedLayout = saveLocalEntity<ApplicationJSON>(
        urlKey,
        applicationJSON
      );
      if (savedLayout) {
        resolve();
      } else {
        reject(new Error("Application Json failed to save"));
      }
    });
  };

  const loadLayouts = (): Promise<Layout[]> => {
    return new Promise((resolve) => {
      const layouts = getLocalEntity<Layout[]>(layoutsSaveLocation);
      resolve(layouts || []);
    });
  };

  const saveLayoutsWithMetadata = (
    layouts: Layout[],
    metadata: LayoutMetadata[]
  ): void => {
    saveLocalEntity<Layout[]>(layoutsSaveLocation, layouts);
    saveLocalEntity<LayoutMetadata[]>(metadataSaveLocation, metadata);
  };

  // Ensures that there is exactly one Layout entry and exactly one Metadata
  // entry in local storage corresponding to the provided ID.
  const validateIds = async (id: string): Promise<void> => {
    return Promise.all([
      validateId(id, "metadata").catch((error) => error.message),
      validateId(id, "layout").catch((error) => error.message),
    ]).then((errorMessages: string[]) => {
      // filter() is used to remove any blank messages before joining.
      // Avoids orphaned delimiters in combined messages, e.g. "; " or "; error 2"
      const combinedMessage = errorMessages
        .filter((msg) => msg !== undefined)
        .join("; ");
      if (combinedMessage) {
        throw new Error(combinedMessage);
      }
    });
  };

  // Ensures that there is exactly one element (Layout or Metadata) in local
  // storage corresponding to the provided ID.
  const validateId = (
    id: string,
    dataType: "metadata" | "layout"
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const loadFunc = dataType === "metadata" ? loadMetadata : loadLayouts;

      loadFunc().then((array: WithId[]) => {
        const count = array.filter((element) => element.id === id).length;
        switch (count) {
          case 1: {
            resolve();
            break;
          }
          case 0: {
            reject(new Error(`No ${dataType} with ID ${id}`));
            break;
          }
          default:
            reject(new Error(`Non-unique ${dataType} with ID ${id}`));
        }
      });
    });
  };

  return {
    saveApplicationJSON,
    createLayout,
    loadApplicationJSON,
    loadLayout,
    loadMetadata,
    updateLayout,
    deleteLayout
  }
};
