package org.finos.vuu.layoutserver.dto.response;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import java.util.Date;
import java.util.UUID;
import lombok.Data;
import org.finos.vuu.layoutserver.dto.BaseMetadataDTO;

@Data
public class MetadataResponseDTO {

    private UUID layoutId;

    @JsonUnwrapped
    BaseMetadataDTO baseMetadata;

    private Date created;
    private Date updated;
}
