import React from 'react';
import { c } from 'ttag';
import { authMember, removeMember, updateRole, privatizeMember } from 'proton-shared/lib/api/members';
import { revokeSessions } from 'proton-shared/lib/api/memberSessions';
import { isSSOMode, isStandaloneMode, MEMBER_PRIVATE, MEMBER_ROLE, APPS } from 'proton-shared/lib/constants';
import memberLogin from 'proton-shared/lib/authentication/memberLogin';
import { Member, Address, User as tsUser, Organization } from 'proton-shared/lib/interfaces';
import { noop } from 'proton-shared/lib/helpers/function';
import isTruthy from 'proton-shared/lib/helpers/isTruthy';
import { revoke } from 'proton-shared/lib/api/auth';
import {
    maybeResumeSessionByUser,
    persistSessionWithPassword,
} from 'proton-shared/lib/authentication/persistedSessionHelper';
import { getAppHref } from 'proton-shared/lib/apps/helper';
import { withUIDHeaders } from 'proton-shared/lib/fetch/headers';
import { getUser } from 'proton-shared/lib/api/user';
import { MemberAuthResponse } from 'proton-shared/lib/authentication/interface';

import { ConfirmModal, Alert, DropdownActions, ErrorButton } from '../../components';
import { useLoading, useModals, useApi, useAuthentication, useNotifications, useEventManager } from '../../hooks';

import EditMemberModal from './EditMemberModal';
import AuthModal from '../password/AuthModal';

interface Props {
    member: Member;
    addresses: Address[];
    organization: Organization;
}

const MemberActions = ({ member, addresses = [], organization }: Props) => {
    const api = useApi();
    const { call } = useEventManager();
    const authentication = useAuthentication();
    const { createNotification } = useNotifications();
    const [loading, withLoading] = useLoading();
    const { createModal } = useModals();

    const handleConfirmDelete = async () => {
        await api(removeMember(member.ID));
        await call();
        createNotification({ text: c('Success message').t`User deleted` });
    };

    const login = async () => {
        const apiConfig = authMember(member.ID);
        const { UID, LocalID } = await new Promise((resolve, reject) => {
            createModal(
                <AuthModal<MemberAuthResponse>
                    onClose={reject}
                    onSuccess={({ result }) => resolve(result)}
                    config={apiConfig}
                />
            );
        });

        if (isSSOMode) {
            const memberApi = <T,>(config: any) => api<T>(withUIDHeaders(UID, config));
            const User = await memberApi<{ User: tsUser }>(getUser()).then(({ User }) => User);

            const done = (localID: number) => {
                window.open(getAppHref('/overview', APPS.PROTONACCOUNT, localID));
            };

            const validatedSession = await maybeResumeSessionByUser(api, User);
            if (validatedSession) {
                memberApi(revoke()).catch(noop);
                done(validatedSession.LocalID);
                return;
            }

            await persistSessionWithPassword({
                api: memberApi,
                keyPassword: authentication.getPassword(),
                User,
                LocalID,
                UID,
                isMember: true,
            });
            done(LocalID);
            return;
        }

        if (isStandaloneMode) {
            return;
        }

        // Legacy mode
        const url = `${location.origin}/login/sub`;
        await memberLogin({ UID, mailboxPassword: authentication.getPassword(), url } as any);
    };

    const makeAdmin = async () => {
        await api(updateRole(member.ID, MEMBER_ROLE.ORGANIZATION_OWNER));
        await call();
        createNotification({ text: c('Success message').t`Role updated` });
    };

    const revokeAdmin = async () => {
        await api(updateRole(member.ID, MEMBER_ROLE.ORGANIZATION_MEMBER));
        await call();
        createNotification({ text: c('Success message').t`Role updated` });
    };

    const makePrivate = async () => {
        await api(privatizeMember(member.ID));
        await call();
        createNotification({ text: c('Success message').t`Status updated` });
    };

    const revokeMemberSessions = async () => {
        await api(revokeSessions(member.ID));
        await call();
        createNotification({ text: c('Success message').t`Sessions revoked` });
    };

    const canMakeAdmin = !member.Self && member.Role === MEMBER_ROLE.ORGANIZATION_MEMBER;
    const canDelete = !member.Self;
    const canEdit = organization.HasKeys;
    const canRevoke = !member.Self && member.Role === MEMBER_ROLE.ORGANIZATION_OWNER;
    const canRevokeSessions = !member.Self;

    const canLogin =
        !member.Self && member.Private === MEMBER_PRIVATE.READABLE && member.Keys.length && addresses.length;
    const canMakePrivate = member.Private === MEMBER_PRIVATE.READABLE;

    const openEdit = () => {
        createModal(<EditMemberModal member={member} onClose={noop} />);
    };

    const openDelete = () => {
        createModal(
            <ConfirmModal
                title={c('Title').t`Delete ${member.Name}`}
                onConfirm={() => withLoading(handleConfirmDelete())}
                confirm={<ErrorButton type="submit" loading={loading}>{c('Action').t`Delete`}</ErrorButton>}
            >
                <Alert type="info">
                    {c('Info')
                        .t`Please note that if you delete this user, you will permanently delete its inbox and remove all addresses associated with it.`}
                </Alert>
                <Alert type="error">{c('Info').t`Are you sure you want to delete this user?`}</Alert>
            </ConfirmModal>
        );
    };

    const list = [
        canEdit && {
            text: c('Member action').t`Edit`,
            onClick: openEdit,
        },
        canDelete && {
            text: c('Member action').t`Delete`,
            actionType: 'delete' as 'delete',
            onClick: openDelete,
        },
        canMakeAdmin && {
            text: c('Member action').t`Make admin`,
            onClick: () => withLoading(makeAdmin()),
        },
        canRevoke && {
            text: c('Member action').t`Revoke admin`,
            onClick: () => withLoading(revokeAdmin()),
        },
        canLogin && {
            text: c('Member action').t`Login`,
            onClick: login,
        },
        canMakePrivate && {
            text: c('Member action').t`Make private`,
            onClick: () => withLoading(makePrivate()),
        },
        canRevokeSessions && {
            text: c('Member action').t`Revoke sessions`,
            onClick: () => withLoading(revokeMemberSessions()),
        },
    ].filter(isTruthy);

    return <DropdownActions loading={loading} list={list} className="pm-button--small" />;
};

export default MemberActions;
