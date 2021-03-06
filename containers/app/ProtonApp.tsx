import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Router } from 'react-router';
import { History, createBrowserHistory as createHistory } from 'history';
import createAuthentication from 'proton-shared/lib/authentication/createAuthenticationStore';
import createCache, { Cache } from 'proton-shared/lib/helpers/cache';
import { formatUser, UserModel } from 'proton-shared/lib/models/userModel';
import { STATUS } from 'proton-shared/lib/models/cache';
import createSecureSessionStorage from 'proton-shared/lib/authentication/createSecureSessionStorage';
import createSecureSessionStorage2 from 'proton-shared/lib/authentication/createSecureSessionStorage2';
import { isSSOMode, MAILBOX_PASSWORD_KEY, UID_KEY, SSO_PATHS, APPS } from 'proton-shared/lib/constants';
import { getPersistedSession } from 'proton-shared/lib/authentication/persistedSessionStorage';
import {
    getBasename,
    getLocalIDFromPathname,
    stripLocalBasenameFromPathname,
} from 'proton-shared/lib/authentication/pathnameHelper';
import { stripLeadingAndTrailingSlash } from 'proton-shared/lib/helpers/string';
import { ProtonConfig } from 'proton-shared/lib/interfaces';
import { replaceUrl } from 'proton-shared/lib/helpers/browser';
import { getAppHref } from 'proton-shared/lib/apps/helper';

import { MimeIcons, Icons } from '../../components';
import Signout from './Signout';
import CompatibilityCheck from './CompatibilityCheck';
import ConfigProvider from '../config/Provider';
import NotificationsProvider from '../notifications/Provider';
import ModalsProvider from '../modals/Provider';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import ApiProvider from '../api/ApiProvider';
import CacheProvider from '../cache/Provider';
import AuthenticationProvider from '../authentication/Provider';
import RightToLeftProvider from '../rightToLeft/Provider';
import { setTmpEventID } from './loadEventID';
import clearKeyCache from './clearKeyCache';
import useInstance from '../../hooks/useInstance';
import { PreventLeaveProvider } from '../../hooks';
import { OnLoginCallbackArguments } from './interface';

interface Props {
    config: ProtonConfig;
    children: React.ReactNode;
}

const getIsSSOPath = (pathname: string) => {
    const strippedPathname = `/${stripLeadingAndTrailingSlash(pathname)}`;
    return Object.values(SSO_PATHS).some((path) => strippedPathname.startsWith(path));
};

const getSafePath = (url: string) => {
    try {
        const { pathname, hash, search } = new URL(url, window.location.origin);
        if (getIsSSOPath(pathname)) {
            return '';
        }
        return `${stripLeadingAndTrailingSlash(stripLocalBasenameFromPathname(pathname))}${search}${hash}`;
    } catch (e) {
        return '';
    }
};

const getPath = (oldUrl: string, requestedPath?: string) => {
    return `/${getSafePath(requestedPath || '/') || getSafePath(oldUrl)}`;
};

const getInitialState = (oldUID?: string, oldLocalID?: number): { UID?: string; localID?: number } | undefined => {
    if (!isSSOMode) {
        return {
            UID: oldUID,
            localID: undefined,
        };
    }
    const pathname = window.location.pathname;
    if (getIsSSOPath(pathname)) {
        // Special routes which should never be logged in
        return;
    }
    const localID = getLocalIDFromPathname(pathname);
    if (localID === undefined || oldLocalID === undefined) {
        return;
    }
    const oldPersistedSession = getPersistedSession(oldLocalID);
    // Current session is active and actual
    if (oldPersistedSession?.UID === oldUID && localID === oldLocalID) {
        return {
            UID: oldUID,
            localID,
        };
    }
};

interface AuthState {
    UID?: string;
    localID?: number;
    history: History;
    isLoggingOut?: boolean;
}

const ProtonApp = ({ config, children }: Props) => {
    const authentication = useInstance(() => {
        if (isSSOMode) {
            return createAuthentication(createSecureSessionStorage2());
        }
        return createAuthentication(createSecureSessionStorage([MAILBOX_PASSWORD_KEY, UID_KEY]));
    });
    const pathRef = useRef<string | undefined>();
    const cacheRef = useRef<Cache<string, any>>();
    if (!cacheRef.current) {
        cacheRef.current = createCache<string, any>();
    }
    const [authData, setAuthData] = useState<AuthState>(() => {
        const state = getInitialState(authentication.getUID(), authentication.getLocalID());
        const history = createHistory({ basename: getBasename(state?.localID) });
        return {
            ...state,
            history,
        };
    });

    const handleLogin = useCallback(
        ({ UID: newUID, EventID, keyPassword, User, LocalID: newLocalID, path }: OnLoginCallbackArguments) => {
            authentication.setUID(newUID);
            authentication.setPassword(keyPassword);
            if (newLocalID !== undefined) {
                authentication.setLocalID(newLocalID);
            }

            const oldCache = cacheRef.current;
            if (oldCache) {
                oldCache.clear();
                oldCache.clearListeners();
            }
            const cache = createCache<string, any>();

            // If the user was received from the login call, pre-set it directly.
            User &&
                cache.set(UserModel.key, {
                    value: formatUser(User),
                    status: STATUS.RESOLVED,
                });

            if (EventID !== undefined) {
                setTmpEventID(cache, EventID);
            }

            cacheRef.current = cache;
            pathRef.current = getPath(window.location.href, path);

            setAuthData({
                UID: newUID,
                localID: newLocalID,
                history: createHistory({ basename: getBasename(newLocalID) }),
            });
        },
        []
    );

    const handleFinalizeLogout = useCallback(() => {
        authentication.setUID(undefined);
        authentication.setPassword(undefined);

        const oldCache = cacheRef.current;
        if (oldCache) {
            clearKeyCache(oldCache);
            oldCache.clear();
            oldCache.clearListeners();
        }

        cacheRef.current = createCache<string, any>();
        pathRef.current = '/';

        if (isSSOMode) {
            return replaceUrl(getAppHref('/switch?flow=logout', APPS.PROTONACCOUNT));
        }
        setAuthData({
            history: createHistory({ basename: getBasename() }),
        });
    }, []);

    const handleLogout = useCallback((type?: 'soft') => {
        setAuthData((authData) => {
            // Nothing to logout
            if (!authData.UID) {
                return authData;
            }
            if (type === 'soft') {
                handleFinalizeLogout();
                return authData;
            }
            return {
                ...authData,
                isLoggingOut: true,
            };
        });
    }, []);

    const { UID, localID, history, isLoggingOut } = authData;

    const authenticationValue = useMemo(() => {
        if (!UID) {
            return {
                login: handleLogin,
            };
        }
        return {
            UID,
            localID,
            ...authentication,
            logout: handleLogout,
        };
    }, [UID]);

    const [, setRerender] = useState<any>();
    useEffect(() => {
        if (pathRef.current !== undefined) {
            // This is to avoid a race condition where the path cannot be replaced imperatively in login or logout
            // because the context will re-render the public app and redirect to a wrong url
            // and while there is a redirect to consume the children are not rendered to avoid the default redirects triggering
            history.replace(pathRef.current);
            pathRef.current = undefined;
            setRerender({});
        }
    }, [pathRef.current, history]);

    const render = () => {
        if (isLoggingOut) {
            return <Signout onDone={handleFinalizeLogout} />;
        }
        if (pathRef.current) {
            return null;
        }
        return children;
    };

    return (
        <ConfigProvider config={config}>
            <CompatibilityCheck>
                <Icons />
                <MimeIcons />
                <RightToLeftProvider>
                    <React.Fragment key={UID}>
                        <Router history={history}>
                            <PreventLeaveProvider>
                                <NotificationsProvider>
                                    <ModalsProvider>
                                        <ApiProvider UID={UID} config={config} onLogout={handleLogout}>
                                            <AuthenticationProvider store={authenticationValue}>
                                                <CacheProvider cache={cacheRef.current}>{render()}</CacheProvider>
                                            </AuthenticationProvider>
                                        </ApiProvider>
                                    </ModalsProvider>
                                </NotificationsProvider>
                            </PreventLeaveProvider>
                        </Router>
                    </React.Fragment>
                </RightToLeftProvider>
            </CompatibilityCheck>
        </ConfigProvider>
    );
};

export default ProtonApp;
