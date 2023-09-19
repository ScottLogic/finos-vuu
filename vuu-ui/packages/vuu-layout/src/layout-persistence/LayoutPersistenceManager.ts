import { LayoutJSON } from "@finos/vuu-layout";
import { Layout, LayoutMetadata } from "@finos/vuu-shell";

export interface LayoutPersistenceManager {
  /**
   * Saves a new layout
   *
   * @param metadata - Metadata about the layout to be saved
   * @param layout   - Full JSON representation of the layout to be saved
   *
   * @returns ID assigned to the saved layout
   */
  saveLayout: (metadata: Omit<LayoutMetadata, "id">, layout: LayoutJSON) => string;

  /**
   * Overwrites an existing layout with a new one
   *
   * @param id       - Unique identifier of the existing layout to be updated
   * @param metadata - Metadata describing the new layout to overwrite with
   * @param layout   - Full JSON representation of the new layout to overwrite with
   */
  updateLayout: (id: string, metadata: Omit<LayoutMetadata, "id">, layout: LayoutJSON) => void;

  /**
   * Deletes an existing layout
   *
   * @param id - Unique identifier of the existing layout to be deleted
   */
  deleteLayout: (id: string) => void;

  /**
   * Retrieves an existing layout
   *
   * @param id - Unique identifier of the existing layout to be retrieved
   *
   * @returns the layout corresponding to provided metadata
   */
  loadLayout: (id: string) => LayoutJSON;

  /**
   * Retrieves metadata for all existing layouts
   *
   * @returns an array of all persisted layout metadata
   */
  loadMetadata: () => LayoutMetadata[];
}
