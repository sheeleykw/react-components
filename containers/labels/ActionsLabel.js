import React from 'react';
import PropTypes from 'prop-types';
import { c } from 'ttag';
import { LABEL_TYPE } from 'proton-shared/lib/constants';
import { deleteLabel } from 'proton-shared/lib/api/labels';

import { Alert, DropdownActions, ConfirmModal, ErrorButton } from '../../components';
import { useApi, useModals, useEventManager, useNotifications } from '../../hooks';
import EditLabelModal from './modals/Edit';

function ActionsLabel({ label, onChange }) {
    const api = useApi();
    const { call } = useEventManager();
    const { createModal } = useModals();
    const { createNotification } = useNotifications();

    const I18N = {
        [LABEL_TYPE.MESSAGE_LABEL]: {
            content: c('Info')
                .t`Please note that emails tagged with this label will NOT be deleted. They can still be found in their respective folder. To permanently delete these emails, open your mailbox, navigate to the label, and select the EMPTY LABEL option from the tool bar.`,
            confirm: c('Info').t`Are you sure you want to delete this label?`,
        },
        [LABEL_TYPE.MESSAGE_FOLDER]: {
            content: c('Info')
                .t`Please note that emails stored in this folder will NOT be deleted. They can still be found in the All Mail folder. To permanently delete these emails, open your mailbox, navigate to the folder, and select the EMPTY FOLDER option from the tool bar.`,
            confirm: c('Info').t`Are you sure you want to delete this folder?`,
        },
    };

    const confirmDelete = async ({ Type, Name }) => {
        return new Promise((resolve, reject) => {
            createModal(
                <ConfirmModal
                    title={c('Title').t`Delete ${Name}`}
                    onConfirm={resolve}
                    confirm={<ErrorButton type="submit">{c('Action').t`Delete`}</ErrorButton>}
                    onClose={reject}
                >
                    <Alert type="info">{I18N[Type].content}</Alert>
                    <Alert type="error">{I18N[Type].confirm}</Alert>
                </ConfirmModal>
            );
        });
    };

    const handleRemove = async () => {
        await confirmDelete(label);
        await api(deleteLabel(label.ID));
        await call();
        createNotification({
            text: c('Success notification').t`${label.Name} removed`,
        });
        onChange && onChange('remove', label);
    };

    const handleEdit = () => {
        createModal(
            <EditLabelModal label={label} mode="edition" onEdit={(label) => onChange && onChange('update', label)} />
        );
    };

    const list = [
        {
            text: c('Action').t`Edit`,
            onClick: handleEdit,
            'data-test-id': 'folders/labels:item-edit',
        },
        {
            text: c('Action').t`Delete`,
            actionType: 'delete',
            onClick: handleRemove,
            'data-test-id': 'folders/labels:item-delete',
        },
    ];

    return <DropdownActions className="pm-button--small" list={list} />;
}

ActionsLabel.propTypes = {
    label: PropTypes.object.isRequired,
    onChange: PropTypes.func,
};

export default ActionsLabel;
