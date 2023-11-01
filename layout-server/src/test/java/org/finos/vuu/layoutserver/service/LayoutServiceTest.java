package org.finos.vuu.layoutserver.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import org.finos.vuu.layoutserver.model.BaseMetadata;
import org.finos.vuu.layoutserver.model.Layout;
import org.finos.vuu.layoutserver.model.Metadata;
import org.finos.vuu.layoutserver.repository.LayoutRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LayoutServiceTest {

    private static final UUID LAYOUT_ID = UUID.randomUUID();
    public static final UUID METADATA_ID = UUID.randomUUID();

    @Mock
    private LayoutRepository layoutRepository;

    @InjectMocks
    private LayoutService layoutService;

    private Layout layout;

    @BeforeEach
    public void setup() {
        BaseMetadata baseMetadata = new BaseMetadata();
        Metadata metadata = new Metadata();
        layout = new Layout();

        baseMetadata.setName("Test Name");
        baseMetadata.setGroup("Test Group");
        baseMetadata.setScreenshot("Test Screenshot");
        baseMetadata.setUser("Test User");

        metadata.setId(METADATA_ID);
        metadata.setBaseMetadata(baseMetadata);

        layout.setId(LAYOUT_ID);
        layout.setDefinition("");
        layout.setMetadata(metadata);
    }

    @Test
    void getLayout_returnsLayout() {
        when(layoutRepository.findById(LAYOUT_ID)).thenReturn(Optional.of(layout));

        assertThat(layoutService.getLayout(LAYOUT_ID)).isEqualTo(layout);
    }

    @Test
    void createLayout_anyLayout_returnsLayoutId() {
        when(layoutRepository.save(layout)).thenReturn(layout);

        assertThat(layoutService.createLayout(layout)).isEqualTo(LAYOUT_ID);
    }

    @Test
    void updateLayout_layoutExists_callsRepositorySave() {
        when(layoutRepository.findById(LAYOUT_ID)).thenReturn(Optional.of(layout));

        layoutService.updateLayout(LAYOUT_ID, layout);

        verify(layoutRepository, times(1)).save(layout);
    }

    @Test
    void updateLayout_layoutDoesNotExist_throwsNoSuchElementException() {
        when(layoutRepository.findById(LAYOUT_ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
            () -> layoutService.updateLayout(LAYOUT_ID, layout));
    }

    @Test
    void deleteLayout_anyUUID_callsRepositoryDeleteById() {
        layoutService.deleteLayout(LAYOUT_ID);

        verify(layoutRepository, times(1)).deleteById(LAYOUT_ID);
    }
}