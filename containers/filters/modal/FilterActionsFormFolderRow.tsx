import React, { ChangeEvent } from 'react';
import { c } from 'ttag';
import { buildTreeview, formatFolderName } from 'proton-shared/lib/helpers/folder';
import { Folder, FolderWithSubFolders } from 'proton-shared/lib/interfaces/Folder';
import { Actions } from 'proton-shared/lib/filters/interfaces';
import { Button, Select, Tooltip, Icon } from '../../../components';
import { useModals } from '../../../hooks';
import { classnames } from '../../../helpers';

import EditLabelModal from '../../labels/modals/Edit';

export const DEFAULT_FOLDERS: SelectOption[] = [
    {
        group: c('Option group').t`Move to...`,
        text: c('Filter Actions').t`Select a folder`,
        value: '',
        disabled: true,
    },
    {
        group: c('Option group').t`Default folders`,
        text: c('Filter Actions').t`Archive`,
        value: 'archive',
    },
    {
        group: c('Option group').t`Default folders`,
        text: c('Filter Actions').t`Inbox`,
        value: 'inbox',
    },
    {
        group: c('Option group').t`Default folders`,
        text: c('Filter Actions').t`Spam`,
        value: 'spam',
    },
    {
        group: c('Option group').t`Default folders`,
        text: c('Filter Actions').t`Trash`,
        value: 'trash',
    },
];

interface Props {
    folders: Folder[];
    isNarrow: boolean;
    actions: Actions;
    handleUpdateActions: (onUpdateActions: Partial<Actions>) => void;
    isDark: boolean;
}

type ChangePayload = {
    folder?: string;
    isOpen: boolean;
};

type SelectOption = {
    value: string;
    text: string;
    group: string;
    disabled?: boolean;
};

const formatOption = ({ Path, Name }: FolderWithSubFolders, level = 0) => ({
    value: Path || '',
    text: formatFolderName(level, Name, ' • '),
    group: c('Option group').t`Custom folders`,
});

const reducer = (acc: SelectOption[] = [], folder: FolderWithSubFolders, level = 0): SelectOption[] => {
    acc.push(formatOption(folder, level));

    if (Array.isArray(folder.subfolders)) {
        folder.subfolders.forEach((folder) => reducer(acc, folder, level + 1));
    }

    return acc;
};

const FilterActionsFormFolderRow = ({ folders, isNarrow, actions, handleUpdateActions, isDark }: Props) => {
    const { createModal } = useModals();
    const treeview = buildTreeview(folders);

    const reducedFolders = treeview.reduce<SelectOption[]>((acc, folder) => {
        return reducer(acc, folder, 0);
    }, []);

    const options = [...DEFAULT_FOLDERS].concat(reducedFolders);

    const { moveTo } = actions;
    const { isOpen } = moveTo;

    const handleChangeModel = (payload: Partial<ChangePayload>) => {
        handleUpdateActions({
            moveTo: {
                ...actions.moveTo,
                ...payload,
            },
        });
    };

    const toggleSection = () => {
        handleChangeModel({ isOpen: !isOpen });
    };

    const handleClear = () => {
        handleChangeModel({ folder: undefined });
    };

    const handleCreateFolder = async () => {
        const folder: Folder = await new Promise((resolve, reject) => {
            createModal(
                <EditLabelModal onAdd={resolve as () => undefined} onClose={reject as () => undefined} type="folder" />
            );
        });

        handleChangeModel({ folder: folder.Path });
    };

    const renderClosed = () => {
        if (!moveTo?.folder) {
            return (
                <em className={classnames(['pt0-5', isDark ? 'color-global-muted' : 'color-global-altgrey'])}>{c('Info')
                    .t`No folder selected`}</em>
            );
        }

        let selectedFolder;

        if (['archive', 'inbox', 'spam', 'trash'].includes(moveTo?.folder)) {
            selectedFolder = (
                <span className="inline-flex flex-items-center mr2">
                    <Icon name={moveTo?.folder} className="mr0-5" />
                    {options.find((o) => o.value === moveTo?.folder)?.text}
                </span>
            );
        } else {
            selectedFolder = moveTo?.folder.split('/').map((f: string, i: number) => (
                <React.Fragment key={f}>
                    {i !== 0 && (
                        <Icon
                            name="caret"
                            className="ml0-5"
                            style={{
                                transform: 'rotate(-90deg)',
                            }}
                        />
                    )}
                    <span
                        className={classnames(['mw100 flex-nowrap inline-flex flex-items-center', i !== 0 && 'ml0-5'])}
                    >
                        <Icon name="folder" className="mr0-5" />
                        <span className="ellipsis" title={f}>
                            {f}
                        </span>
                    </span>
                </React.Fragment>
            ));
        }

        return <div className="pt0-5 flex flex-items-center mw100">{selectedFolder}</div>;
    };

    return (
        <div className="border-bottom flex flex-nowrap onmobile-flex-column align-items-center pt1 pb1">
            <button type="button" className={classnames(['w20 alignleft', isNarrow && 'mb1'])} onClick={toggleSection}>
                <Icon name="caret" className={classnames([isOpen && 'rotateX-180'])} />
                <span className={classnames(['ml0-5', actions.error && 'color-global-warning'])}>{c('Label')
                    .t`Move to`}</span>
            </button>
            <div className={classnames(['flex flex-column flex-item-fluid', !isNarrow && 'ml1'])}>
                {isOpen ? (
                    <div className="w100">
                        <Select
                            id="memberSelect"
                            value={moveTo.folder || ''}
                            options={options}
                            onChange={({ target: { value } }: ChangeEvent<HTMLSelectElement>) =>
                                handleChangeModel({ folder: value })
                            }
                        />
                        <Button className="mt1" onClick={handleCreateFolder}>
                            {c('Action').t`Create folder`}
                        </Button>
                    </div>
                ) : (
                    renderClosed()
                )}
            </div>
            <div>
                <Button
                    disabled={!moveTo?.folder}
                    onClick={handleClear}
                    className={classnames(['pm-button--for-icon', isNarrow ? 'mt1' : 'ml1'])}
                >
                    <Tooltip
                        title={c('Action').t`Reset`}
                        className={classnames([isDark ? 'color-global-muted' : 'color-global-altgrey'])}
                    >
                        <Icon name="remove-text-formatting" />
                    </Tooltip>
                </Button>
            </div>
        </div>
    );
};

export default FilterActionsFormFolderRow;
