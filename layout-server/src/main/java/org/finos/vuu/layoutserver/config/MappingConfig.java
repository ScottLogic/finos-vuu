package org.finos.vuu.layoutserver.config;

import org.finos.vuu.layoutserver.dto.request.LayoutRequestDTO;
import org.finos.vuu.layoutserver.dto.request.MetadataRequestDTO;
import org.finos.vuu.layoutserver.model.Layout;
import org.finos.vuu.layoutserver.model.Metadata;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MappingConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        mapper.typeMap(LayoutRequestDTO.class, Layout.class).addMappings(m -> m.skip(Layout::setId));

        mapper.typeMap(MetadataRequestDTO.class, Metadata.class).addMappings(m -> m.skip(Metadata::setId));

        return mapper;
    }
}
