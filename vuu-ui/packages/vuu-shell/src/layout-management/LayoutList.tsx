import { List } from '@finos/vuu-ui-controls';
import { LayoutMetadata } from './layoutTypes';

import './LayoutList.css'

type LayoutGroups = {
    [groupName: string]: LayoutMetadata[]
}

const classBase = "vuuLayoutList";

export const LayoutsList = (props: { layouts: LayoutMetadata[] }) => {
    const { layouts } = props;

    const layoutsByGroup = layouts.reduce((acc: LayoutGroups, cur) => {
        if (acc[cur.group]) {
            return {
                ...acc,
                [cur.group]: [...acc[cur.group], cur]
            }
        }
        return {
            ...acc,
            [cur.group]: [cur]
        }
    }, {})

    return (
        <>
            <div className={`${classBase}-header`}>My Layouts</div>
            <List<[string, LayoutMetadata[]]>
                height='fit-content'
                source={Object.entries(layoutsByGroup)}
                ListItem={({ item }) => <>
                    <div className={`${classBase}-groupName`}>{item?.[0]}</div>
                    <List<LayoutMetadata>
                        height='fit-content'
                        source={item?.[1]}
                        ListItem={({ item: layout }) =>
                            <div
                                className={`${classBase}-layoutContainer`}
                                key={layout?.id}
                            >
                                <img className={`${classBase}-screenshot`} src={layout?.screenshot} />
                                <div>
                                    <div className={`${classBase}-layoutName`}>{layout?.name}</div>
                                    <div className={`${classBase}-layoutDetails`}>
                                        <div>{`${layout?.user}, ${layout?.date}`}</div>
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </>
                }
            />
        </>
    );
};

