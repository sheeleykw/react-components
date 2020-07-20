import React, { ReactNode } from 'react';
import { PAYMENT_METHOD_TYPES, PAYMENT_TOKEN_STATUS } from 'proton-shared/lib/constants';
import { getTokenStatus, createToken } from 'proton-shared/lib/api/payments';
import { Api } from 'proton-shared/lib/interfaces';
import { wait } from 'proton-shared/lib/helpers/promise';
import { c } from 'ttag';
import { getHostname } from 'proton-shared/lib/helpers/url';
import { PaymentVerificationModal } from '../../index';
import { PaymentParameters } from './usePayment';

const {
    STATUS_PENDING,
    STATUS_CHARGEABLE,
    STATUS_FAILED,
    STATUS_CONSUMED,
    STATUS_NOT_SUPPORTED,
} = PAYMENT_TOKEN_STATUS;

const { TOKEN, BITCOIN, CASH } = PAYMENT_METHOD_TYPES;

const DELAY_PULLING = 5000;
const DELAY_LISTENING = 1000;

/**
 * Recursive function to check token status
 */
const pull = async ({
    timer = 0,
    Token,
    api,
    signal,
}: {
    timer?: number;
    Token: string;
    api: Api;
    signal: AbortSignal;
}): Promise<any> => {
    if (signal.aborted) {
        throw new Error(c('Error').t`Process aborted`);
    }

    if (timer > DELAY_PULLING * 30) {
        throw new Error(c('Error').t`Payment process cancelled`);
    }

    const { Status } = await api({ ...getTokenStatus(Token), signal });

    if (Status === STATUS_FAILED) {
        throw new Error(c('Error').t`Payment process failed`);
    }

    if (Status === STATUS_CONSUMED) {
        throw new Error(c('Error').t`Payment process consumed`);
    }

    if (Status === STATUS_NOT_SUPPORTED) {
        throw new Error(c('Error').t`Payment process not supported`);
    }

    if (Status === STATUS_CHARGEABLE) {
        return;
    }

    if (Status === STATUS_PENDING) {
        await wait(DELAY_PULLING);
        return pull({ Token, api, timer: timer + DELAY_PULLING, signal });
    }

    throw new Error(c('Error').t`Unknown payment token status`);
};

/**
 * Initialize new tab and listen it
 */
export const process = ({
    Token,
    api,
    ApprovalURL,
    ReturnHost,
    signal,
}: {
    Token: string;
    api: Api;
    ApprovalURL: string;
    ReturnHost: string;
    signal: AbortSignal;
}) => {
    const tab = window.open(ApprovalURL);

    return new Promise((resolve, reject) => {
        let listen = false;

        const reset = () => {
            listen = false;
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            window.removeEventListener('message', onMessage, false);
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            signal.removeEventListener('abort', abort);
        };

        const listenTab = async (): Promise<any> => {
            if (!listen) {
                return;
            }

            if (tab && tab.closed) {
                try {
                    reset();
                    const { Status } = await api({ ...getTokenStatus(Token), signal });
                    if (Status === STATUS_CHARGEABLE) {
                        return resolve();
                    }
                    throw new Error(c('Error').t`Tab closed`);
                } catch (error) {
                    return reject({ ...error, tryAgain: true });
                }
            }

            await wait(DELAY_LISTENING);
            return listenTab();
        };

        const onMessage = (event: MessageEvent) => {
            if (getHostname(event.origin) !== ReturnHost) {
                return;
            }

            reset();
            tab && tab.close();

            const { cancel } = event.data;

            if (cancel === '1') {
                return reject();
            }

            pull({ Token, api, signal }).then(resolve).catch(reject);
        };

        const abort = () => {
            reset();
            tab && tab.close();
            reject(new Error(c('Error').t`Process aborted`));
        };

        signal.addEventListener('abort', abort);
        window.addEventListener('message', onMessage, false);
        listen = true;
        listenTab();
    });
};

/**
 * Prepare parameters to be sent to API
 */
export const toParams = (params: Params, Token: string, type?: string) => {
    return {
        ...params,
        type,
        Payment: {
            Type: TOKEN,
            Details: {
                Token,
            },
        },
    };
};

interface Params extends PaymentParameters {
    Amount: number;
    Currency: string;
}

export const handlePaymentToken = async ({
    params,
    api,
    createModal,
    mode,
}: {
    createModal: (modal: ReactNode) => void;
    mode?: string;
    api: Api;
    params: Params;
}): Promise<Params> => {
    const { Payment, Amount, Currency, PaymentMethodID } = params;
    const { Type } = Payment || {};

    if (Amount === 0) {
        return params;
    }

    if (Type && [CASH, BITCOIN, TOKEN].includes(Type)) {
        return params;
    }

    const { Token, Status, ApprovalURL, ReturnHost } = await api(
        createToken({
            Payment,
            Amount,
            Currency,
            PaymentMethodID,
        })
    );

    if (Status === STATUS_CHARGEABLE) {
        return toParams(params, Token, Type);
    }

    return new Promise((resolve, reject) => {
        createModal(
            <PaymentVerificationModal
                mode={mode}
                payment={Payment}
                params={params}
                token={Token}
                onSubmit={resolve}
                onClose={reject}
                onProcess={() => {
                    const abort = new AbortController();
                    return {
                        promise: process({
                            Token,
                            api,
                            ReturnHost,
                            ApprovalURL,
                            signal: abort.signal,
                        }),
                        abort,
                    };
                }}
            />
        );
    });
};
