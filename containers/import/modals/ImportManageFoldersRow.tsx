import React, { ChangeEvent, useState, useRef, useEffect, useMemo } from 'react';
import { c } from 'ttag';

import { Tooltip, Icon, Checkbox, InlineLinkButton, Input } from '../../../components';
import { classnames } from '../../../helpers';

import {
    DestinationFolder,
    CheckedFoldersMap,
    DisabledFoldersMap,
    FolderRelationshipsMap,
    MailImportFolder,
    FolderNamesMap,
    FolderPathsMap,
} from '../interfaces';

import { PATH_SPLIT_REGEX } from '../constants';

import { unescapeSlashes, escapeSlashes } from './ImportManageFolders';

const FOLDER_ICONS = {
    [DestinationFolder.INBOX]: 'inbox',
    [DestinationFolder.ALL_DRAFTS]: 'drafts',
    [DestinationFolder.ALL_SENT]: 'sent',
    [DestinationFolder.TRASH]: 'trash',
    [DestinationFolder.SPAM]: 'spam',
    [DestinationFolder.ARCHIVE]: 'archive',
    [DestinationFolder.SENT]: 'sent',
    [DestinationFolder.DRAFTS]: 'drafts',
    [DestinationFolder.STARRED]: 'star',
    [DestinationFolder.ALL_MAIL]: 'all-emails',
};

const ERRORS = {
    nameTooLongError: c('Error').t`The folder name is too long. Please choose a different name.`,
    emptyValueError: c('Error').t`Folder name cannot be empty`,
};

const WARNINGS = {
    mergeWarning: c('Warning').t`This folder name already exists. Messages will be imported into the existing folder.`,
};

const DIMMED_OPACITY_CLASSNAME = 'opacity-30';

interface WrapperProps {
    isLabel: boolean;
    children: React.ReactNode;
    checkboxId: string;
    className: string;
}

const RowWrapperComponent = ({ isLabel, children, checkboxId, className }: WrapperProps) => {
    return isLabel ? (
        <label htmlFor={checkboxId} className={className}>
            {children}
        </label>
    ) : (
        <div className={className}>{children}</div>
    );
};

interface Props {
    onRename: (source: string, newName: string) => void;
    onToggleCheck: (source: string, checked: boolean) => void;
    folder: MailImportFolder;
    level: number;
    checkedFoldersMap: CheckedFoldersMap;
    disabledFoldersMap: DisabledFoldersMap;
    folderRelationshipsMap: FolderRelationshipsMap;
    providerFolders: MailImportFolder[];
    folderNamesMap: FolderNamesMap;
    folderPathsMap: FolderPathsMap;
    toggleEditing: (editing: boolean) => void;
    getParent: (folderName: string) => string | undefined;
}

const ImportManageFoldersRow = ({
    folder,
    level,
    onToggleCheck,
    checkedFoldersMap,
    disabledFoldersMap,
    folderRelationshipsMap,
    providerFolders,
    folderNamesMap,
    folderPathsMap,
    onRename,
    toggleEditing,
    getParent,
}: Props) => {
    const { Source, Separator, DestinationFolder } = folder;

    const checked = checkedFoldersMap[Source];
    const disabled = disabledFoldersMap[Source];

    const children = folderRelationshipsMap[Source].reduce<MailImportFolder[]>((acc, childName) => {
        const found = providerFolders.find((f) => f.Source === childName);
        if (found) {
            acc.push(found);
        }
        return acc;
    }, []);

    const levelDestination = Math.min(level, 2);

    const destinationName = folderNamesMap[Source];

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(unescapeSlashes(destinationName));
    const initialValue = useRef<string>(inputValue);

    const emptyValueError = useMemo(() => !inputValue || !inputValue.trim(), [inputValue]);

    const nameTooLongError = useMemo(() => {
        if (!checked) {
            return false;
        }
        return escapeSlashes(inputValue).length >= 100;
    }, [inputValue, checked]);

    const mergeWarning = useMemo(() => {
        if (!checked) {
            return false;
        }

        let parentPath = getParent(folder.Source);
        const pathParts = [inputValue];

        while (parentPath) {
            pathParts.unshift(folderNamesMap[parentPath]);
            parentPath = getParent(parentPath);
        }

        const newPath = pathParts.join('/');

        return Object.entries(folderPathsMap).some(([source, path]) => {
            return source !== Source && path === newPath && checkedFoldersMap[source];
        });
    }, [inputValue, checked, folderNamesMap, folderPathsMap, checkedFoldersMap]);

    const hasError = emptyValueError || nameTooLongError;

    const [editMode, setEditMode] = useState(hasError);

    const toggleEditMode = (e: React.MouseEvent) => {
        if (disabled || editMode) {
            return;
        }
        if (!editMode) {
            initialValue.current = inputValue;
        }

        setEditMode(!editMode);
    };

    const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        setEditMode(false);
        onRename(Source, inputValue);
        initialValue.current = inputValue;
    };

    const preventDefaultAndStopPropagation = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleCancel = (e: React.MouseEvent) => {
        preventDefaultAndStopPropagation(e);

        setEditMode(false);
        setInputValue(initialValue.current);
    };

    const renderInput = () => {
        let error;
        let warning;
        let item;

        if (nameTooLongError) {
            error = ERRORS.nameTooLongError;
        }

        if (emptyValueError) {
            error = ERRORS.emptyValueError;
        }

        if (warning) {
            item = (
                <Tooltip title={WARNINGS.mergeWarning} type="warning">
                    <Icon
                        tabIndex={-1}
                        name="info"
                        className="color-global-attention inline-flex flex-self-vcenter flex-item-noshrink"
                    />
                </Tooltip>
            );
        }

        if (error) {
            item = (
                <Tooltip title={error} type="error">
                    <Icon
                        tabIndex={-1}
                        name="info"
                        className="color-global-warning inline-flex flex-self-vcenter flex-item-noshrink"
                    />
                </Tooltip>
            );
        }

        return (
            <Input
                autoFocus
                required
                isSubmitted
                ref={inputRef}
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onPressEnter={(e: React.KeyboardEvent) => {
                    e.preventDefault();
                    if (emptyValueError || nameTooLongError) {
                        return;
                    }
                    handleSave(e);
                }}
                icon={item}
                error={error || warning}
                errorZoneClassName="hidden"
            />
        );
    };

    const getSourceDisplayName = () => {
        const split = Source.split(Separator === '/' ? PATH_SPLIT_REGEX : Separator);

        let parentName = '';

        while (split.length && !parentName) {
            split.pop();
            const parent = providerFolders.find((f) => f.Source === split.join(Separator));
            if (parent) {
                parentName = parent.Source;
            }
        }

        return folder.Source.replace(`${parentName}${Separator}`, '');
    };

    useEffect(() => {
        if (disabled) {
            setEditMode(false);
            setInputValue(initialValue.current);
        }
    }, [disabled]);

    useEffect(() => {
        if (editMode && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
        toggleEditing(editMode);
    }, [editMode]);

    return (
        <li>
            <div className="border-bottom">
                <RowWrapperComponent
                    isLabel={!editMode}
                    checkboxId={Source}
                    className={classnames([
                        'flex flex-nowrap flex-items-center pt1 pb1',
                        !checked && DIMMED_OPACITY_CLASSNAME,
                        (disabled || editMode) && 'cursor-default',
                    ])}
                >
                    <div className="flex w40 flex-nowrap flex-items-center flex-item-noshrink pr1">
                        <div
                            className="flex-item-noshrink"
                            style={DestinationFolder ? undefined : { marginLeft: `${level}em` }}
                        >
                            <Checkbox
                                onChange={({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
                                    if (!checked && editMode) {
                                        setEditMode(false);
                                    }
                                    onToggleCheck(Source, checked);
                                }}
                                id={Source}
                                checked={checked}
                                disabled={disabled}
                            />
                        </div>
                        <div className="ml0-5 flex-item-fluid-auto ellipsis" title={getSourceDisplayName()}>
                            {getSourceDisplayName()}
                        </div>
                    </div>

                    <div className="flex w40 pr1">
                        <div
                            className="flex flex-nowrap flex-items-center flex-item-fluid-auto"
                            style={DestinationFolder ? undefined : { marginLeft: `${levelDestination}em` }}
                        >
                            <Icon
                                name={DestinationFolder ? FOLDER_ICONS[DestinationFolder] : 'folder'}
                                className={classnames([
                                    'flex-item-noshrink',
                                    hasError && 'color-global-warning',
                                    mergeWarning && 'color-global-attention',
                                ])}
                            />
                            <div
                                className={classnames([
                                    'ml0-5 w100 flex flex-nowrap',
                                    hasError && 'color-global-warning',
                                    mergeWarning && 'color-global-attention',
                                ])}
                            >
                                {editMode && !disabled ? (
                                    renderInput()
                                ) : (
                                    <>
                                        <span
                                            className={classnames([
                                                'flex-item-fluid-auto ellipsis',
                                                (nameTooLongError || mergeWarning) && 'bold',
                                            ])}
                                            title={destinationName}
                                        >
                                            {unescapeSlashes(destinationName)}
                                        </span>
                                        {nameTooLongError && (
                                            <Tooltip
                                                title={ERRORS.nameTooLongError}
                                                className="flex-item-noshrink"
                                                type="error"
                                            >
                                                <Icon
                                                    tabIndex={-1}
                                                    name="info"
                                                    className="color-global-warning inline-flex flex-self-vcenter flex-item-noshrink"
                                                />
                                            </Tooltip>
                                        )}
                                        {mergeWarning && (
                                            <Tooltip
                                                title={WARNINGS.mergeWarning}
                                                className="flex-item-noshrink"
                                                type="warning"
                                            >
                                                <Icon
                                                    tabIndex={-1}
                                                    name="info"
                                                    className="color-global-attention inline-flex flex-self-vcenter flex-item-noshrink"
                                                />
                                            </Tooltip>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {!DestinationFolder && (
                        <div
                            className="flex w20 flex-items-center"
                            onClick={(e) => {
                                if (disabled) {
                                    preventDefaultAndStopPropagation(e);
                                }
                            }}
                        >
                            {editMode && !disabled ? (
                                <>
                                    <InlineLinkButton
                                        onClick={handleSave}
                                        className={classnames(['p0-5', hasError && DIMMED_OPACITY_CLASSNAME])}
                                        aria-disabled={hasError}
                                        disabled={hasError}
                                    >
                                        {c('Action').t`Save`}
                                    </InlineLinkButton>
                                    <InlineLinkButton onClick={handleCancel} className="ml0-5 p0-5">
                                        {c('Action').t`Cancel`}
                                    </InlineLinkButton>
                                </>
                            ) : (
                                <InlineLinkButton
                                    aria-disabled={!checked}
                                    disabled={!checked}
                                    tabIndex={disabled ? -1 : 0}
                                    onClick={toggleEditMode}
                                    className="p0-5"
                                >
                                    {c('Action').t`Rename`}
                                </InlineLinkButton>
                            )}
                        </div>
                    )}
                </RowWrapperComponent>
            </div>
            {children.length > 0 && (
                <ul className="unstyled m0">
                    {children.map((f) => (
                        <ImportManageFoldersRow
                            onToggleCheck={onToggleCheck}
                            key={f.Source}
                            folder={f}
                            level={level + 1}
                            checkedFoldersMap={checkedFoldersMap}
                            disabledFoldersMap={disabledFoldersMap}
                            folderRelationshipsMap={folderRelationshipsMap}
                            providerFolders={providerFolders}
                            folderNamesMap={folderNamesMap}
                            folderPathsMap={folderPathsMap}
                            onRename={onRename}
                            toggleEditing={toggleEditing}
                            getParent={getParent}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default ImportManageFoldersRow;
