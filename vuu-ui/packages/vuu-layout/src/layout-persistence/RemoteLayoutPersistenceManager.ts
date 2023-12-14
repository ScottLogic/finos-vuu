import { LayoutMetadata, LayoutMetadataDto } from "@finos/vuu-shell";
import { LayoutPersistenceManager } from "./LayoutPersistenceManager";
import { ApplicationJSON, LayoutJSON } from "../layout-reducer";

const baseURL = process.env.LAYOUT_BASE_URL;
const metadataSaveLocation = "layouts/metadata";
const layoutsSaveLocation = "layouts";
const applicationLayoutsSaveLocation = "application-layouts";

export type CreateLayoutResponseDto = { metadata: LayoutMetadata };
export type GetLayoutResponseDto = { definition: LayoutJSON };
export type GetApplicationResponseDto = { definition: ApplicationJSON };

export const RemoteLayoutPersistenceManager = (): LayoutPersistenceManager => {
  const createLayout = (
    metadata: LayoutMetadataDto,
    layout: LayoutJSON
  ): Promise<LayoutMetadata> =>{
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${layoutsSaveLocation}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          metadata,
          definition: layout,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          response.json().then(({ metadata }: CreateLayoutResponseDto) => {
            if (!metadata) {
              reject(new Error("Response did not contain valid metadata"));
            }
            resolve(metadata);
          });
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  const updateLayout = (
    id: string,
    metadata: LayoutMetadataDto,
    newLayoutJson: LayoutJSON
  ): Promise<void> => {
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${layoutsSaveLocation}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          metadata,
          layout: newLayoutJson,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  const deleteLayout =(id: string): Promise<void> => {
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${layoutsSaveLocation}/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  const loadLayout = (id: string): Promise<LayoutJSON> => {
    return new Promise((resolve, reject) => {
      fetch(`${baseURL}/${layoutsSaveLocation}/${id}`, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          response.json().then(({ definition }: GetLayoutResponseDto) => {
            if (!definition) {
              reject(new Error("Response did not contain a valid layout"));
            }
            resolve(definition);
          });
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  const loadMetadata = (): Promise<LayoutMetadata[]> =>{
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${metadataSaveLocation}`, {
        method: "GET",
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          response.json().then((metadata: LayoutMetadata[]) => {
            if (!metadata) {
              reject(new Error("Response did not contain valid metadata"));
            }
            resolve(metadata);
          });
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  const saveApplicationJSON = (applicationJSON: ApplicationJSON): Promise<void> =>{
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${applicationLayoutsSaveLocation}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          username: "vuu-user",
        },
        body: JSON.stringify(applicationJSON),
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  const loadApplicationJSON =(): Promise<ApplicationJSON>=> {
    return new Promise((resolve, reject) =>
      fetch(`${baseURL}/${applicationLayoutsSaveLocation}`, {
        method: "GET",
        headers: {
          username: "vuu-user",
        },
      })
        .then((response) => {
          if (!response.ok) {
            reject(new Error(response.statusText));
          }
          response.json().then((applicationJSON: GetApplicationResponseDto) => {
            if (!applicationJSON) {
              reject(
                new Error(
                  "Response did not contain valid application layout information"
                )
              );
            }
            resolve(applicationJSON.definition);
          });
        })
        .catch((error: Error) => {
          reject(error);
        })
    );
  }

  return {
    saveApplicationJSON,
    createLayout,
    loadApplicationJSON,
    loadLayout,
    loadMetadata,
    updateLayout,
    deleteLayout
  }
}
