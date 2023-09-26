package org.finos.vuu.layoutserver.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Date;

@Data
public class MetadataRequestDTO {

    private String name;
    private String group;
    private String screenshot;
    private String user;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Date updated = new Date();
}
