import { c } from 'ttag';
import { decryptPrivateKey, encryptPrivateKey, getKeys, OpenPGPKey } from 'pmcrypto';
import { reformatAddressKey, decryptPrivateKeyWithSalt } from 'proton-shared/lib/keys/keys';
import { KeySalt, ActionableKey, Api, Address, CachedKey } from 'proton-shared/lib/interfaces';
import { reactivateKeyAction } from 'proton-shared/lib/keys/keysAction';
import { getDefaultKeyFlagsAddress, getDefaultKeyFlagsUser } from 'proton-shared/lib/keys/keyFlags';
import { reactivateKeyRoute } from 'proton-shared/lib/api/keys';
import getSignedKeyList from 'proton-shared/lib/keys/getSignedKeyList';
import { noop } from 'proton-shared/lib/helpers/function';

interface ReactivatePrivateKeyArguments {
    api: Api;
    ID: string;
    parsedKeys: CachedKey[];
    actionableKeys: ActionableKey[];
    signingKey: OpenPGPKey;
    privateKey: OpenPGPKey;
    encryptedPrivateKeyArmored: string;
    Address?: Address;
}
export const reactivatePrivateKey = async ({
    api,
    ID,
    parsedKeys,
    actionableKeys,
    privateKey,
    signingKey,
    encryptedPrivateKeyArmored,
    Address,
}: ReactivatePrivateKeyArguments) => {
    const result = reactivateKeyAction({
        ID,
        parsedKeys,
        actionableKeys,
        privateKey,
        flags: Address ? getDefaultKeyFlagsAddress(Address, parsedKeys) : getDefaultKeyFlagsUser(),
    });

    await api(
        reactivateKeyRoute({
            ID,
            PrivateKey: encryptedPrivateKeyArmored,
            SignedKeyList: Address ? await getSignedKeyList(result, signingKey) : undefined,
        })
    );

    return result;
};

const getOldUserID = async (PrivateKey: string) => {
    const [oldPrivateKey] = await getKeys(PrivateKey);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore - openpgp typings are incorrect, todo
    const { email } = oldPrivateKey.users[0].userId;
    return email;
};

interface ReactivateByUploadArguments {
    ID: string;
    PrivateKey: string;
    uploadedPrivateKey: OpenPGPKey;
    parsedKeys: CachedKey[];
    newPassword: string;
    email?: string;
}
export const reactivateByUpload = async ({
    ID,
    newPassword,
    PrivateKey,
    uploadedPrivateKey,
    parsedKeys,
    email,
}: ReactivateByUploadArguments) => {
    const uploadedFingerprint = uploadedPrivateKey.getFingerprint();
    const oldKeyContainer = parsedKeys.find(({ privateKey }) => privateKey?.getFingerprint() === uploadedFingerprint);

    if (!oldKeyContainer) {
        throw new Error(c('Error').t`Key does not exist`);
    }
    if (oldKeyContainer.Key.ID !== ID) {
        throw new Error(c('Error').t`Key ID mismatch`);
    }

    // When reactivating a key by uploading it, get the email from the old armored private key to ensure it's correct for the user keys
    const oldUserId = (await getOldUserID(PrivateKey).catch(noop)) || email;

    const { privateKey: reformattedPrivateKey, privateKeyArmored } = await reformatAddressKey({
        email: oldUserId,
        passphrase: newPassword,
        privateKey: uploadedPrivateKey,
    });

    return {
        privateKey: reformattedPrivateKey,
        encryptedPrivateKeyArmored: privateKeyArmored,
    };
};

interface ReactivateByPasswordArguments {
    ID: string;
    keySalts: KeySalt[];
    PrivateKey: string;
    oldPassword: string;
    newPassword: string;
}
export const reactivateByPassword = async ({
    ID,
    keySalts,
    PrivateKey,
    oldPassword,
    newPassword,
}: ReactivateByPasswordArguments) => {
    const { KeySalt } = keySalts.find(({ ID: keySaltID }) => ID === keySaltID) || {};

    const oldPrivateKey = await decryptPrivateKeyWithSalt({
        PrivateKey,
        keySalt: KeySalt,
        password: oldPassword,
    }).catch(noop);

    if (!oldPrivateKey) {
        throw new Error(c('Error').t`Incorrect password`);
    }

    const encryptedPrivateKeyArmored = await encryptPrivateKey(oldPrivateKey, newPassword);
    const privateKey = await decryptPrivateKey(encryptedPrivateKeyArmored, newPassword);

    return {
        privateKey,
        encryptedPrivateKeyArmored,
    };
};
