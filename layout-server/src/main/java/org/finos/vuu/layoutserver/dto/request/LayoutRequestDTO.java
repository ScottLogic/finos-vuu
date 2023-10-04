package org.finos.vuu.layoutserver.dto.request;

import lombok.Data;

@Data
public class LayoutRequestDTO {

    /**
     * The definition of the layout as a string (e.g. stringified JSON structure containing components)
     */
    private String definition;

    private MetadataRequestDTO metadata;
}
