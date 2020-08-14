import { Label } from 'proton-shared/lib/interfaces/Label';
import { TIME_UNIT } from './constants';

export enum DestinationFolder {
    INBOX = 'Inbox',
    ALL_DRAFTS = 'All Drafts',
    ALL_SENT = 'All Sent',
    TRASH = 'Trash',
    SPAM = 'Spam',
    ALL_MAIL = 'All Mail',
    STARRED = 'Starred',
    ARCHIVE = 'Archive',
    SENT = 'Sent',
    DRAFTS = 'Drafts',
}

export enum IMPORT_ERROR {
    AUTH_IMAP = 2000,
    AUTH_CREDENTIALS = 2902,
    ALREADY_EXISTS = 2500,
}

export interface ImportedFolder {
    SourceFolder: string;
    DestinationFolder?: DestinationFolder;
    Processed: number;
    Total: number;
}

export interface MailImportFolder {
    Name: string;
    Total: number;
    Flags: string[];
    DestinationFolder?: DestinationFolder;
    Size: number;
}

export enum Step {
    START,
    PREPARE,
    STARTED,
}

export interface ImportModalModel {
    providerFolders: MailImportFolder[];
    step: Step;
    needDetails: boolean;
    importID: string;
    email: string;
    password: string;
    port: string;
    imap: string;
    errorCode: number;
    selectedPeriod: TIME_UNIT;
    payload: ImportPayloadModel;
}

export interface FolderMapping {
    Source: string;
    Destinations: {
        FolderName: string;
    };
}

export interface ImportPayloadModel {
    AddressID?: string;
    Code?: string;
    ImportLabel?: Partial<Label>;
    StartTime?: Date;
    EndTime?: Date;
    Mapping: FolderMapping[];
}

export enum ImportMailStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    PAUSED = 2,
    CANCELED = 3,
    DONE = 4,
    FAILED = 5,
}

export interface ImportMail {
    ID: string;
    CreationTime: number;
    Email: string;
    AddressID: string;
    Status: ImportMailStatus;
    FilterStartDate: string;
    FilterEndDate: string;
    FolderMapping: ImportedFolder[];
}

export enum ImportMailReportStatus {
    CANCELED = 3,
    DONE = 4,
    FAILED = 5,
}

export interface ImportMailReport {
    ID: string;
    Email: string;
    Status: ImportMailReportStatus;
    CreateTime: number;
    EndTime: number;
    Report: string;
}