// Word lists
type AccountPlatform = 'evm' | 'solana' | 'flow' | 'twitter' | 'misskey' | 'jike' | 'playstation' | 'github';
type ItemPlatform = AccountPlatform | 'rss3';
type LinkType = 'following' | 'comment' | 'like' | 'collection' | 'forward';
type AutoAssetType = 'gitcoin_donation' | 'xdai_poap' | 'bsc_nft' | 'ethereum_nft' | 'polygon_nft';
type AutoNoteType = AutoAssetType | 'mirror_entry' | 'twitter_tweet' | 'misskey_note' | 'jike_node';

// Instance
type AccountInstance = string;          // account:${identity}@${AccountPlatform}
type ItemInstance = string;             // ${'asset' | 'note'}:${uniqueID}@${ItemPlatform}    uniqueID: uuid ${chain}-${token_address}-${token_id} ...
type ExternalInstance = string;         // external:${authority}@${scheme}    eg: external:diygod.me%2Fatom.xml@https

type Instance = AccountInstance | ItemInstance | ExternalInstance;

// URI
type InstanceURI = string;              // rss3://${Instance}

type ItemURI = string;                  // ${InstanceURI}/${'note' | 'asset'}/${uuid}

type CustomItemListURI = string;        // ${InstanceURI}/list/${'notes' | 'assets'}/${index}
type AggregatedItemListURI = string;    // ${InstanceURI}/list/${'notes' | 'assets'}

type CustomLinkListURI = string;        // ${InstanceURI | ItemURI}/list/links/${LinkType}/${index}
type AggregatedLinkListURI = string;    // ${InstanceURI | ItemURI}/list/links/${LinkType}
type BacklinkListURI = string;          // ${InstanceURI | ItemURI}/list/backlinks

type URI = string;                      // Any uri

// Common attributes for each files
interface Base {
    version: 'v0.4.0'; // Proposal version for current file. It should be like `v1.0.0`
    identifier: InstanceURI | CustomItemListURI | AggregatedItemListURI | CustomLinkListURI | AggregatedLinkListURI | BacklinkListURI;
    date_created: string; // Specifies the created date in RFC 3339 format
    date_updated: string; // Specifies the updated date in RFC 3339 format
}

interface SignedBase extends Base {
    signature: string; // Signed by instance's private key, the signature message is JSON string sorted by key alphabet: `[RSS3] I am confirming the results of changes to my file ${identifier}: JSON.stringify(file, Object.keys(file).sort())`
    agents?: {
        pubkey: string; // A random ed25519 public key generated by the client
        signature: string; // A signature signed by pubkey's private key, the message is the same as `signature`
        authorization: string; // A signature signed by instance's private key, the message is `[RSS3] I am well aware that this APP (name: ${app}) can use the following agent instead of me (${InstanceURI}) to modify my files and I would like to authorize this agent (${pubkey})`
        app: string; // Name of the app using this agent, eg: Revery
        date_expired: string; // Specifies the expired date in RFC 3339 format
    }[];
    controller?: string; // A contract address indicating ownership of the file
}

interface UnsignedBase extends Base {
    auto: true;
}

// Base types
interface Attachment {
    type?: string;
    content?: string; // Actual content, mutually exclusive with address
    address?: URI; // URI pointing to third parties, mutually exclusive with content
    mime_type: string; // [MIME type](https://en.wikipedia.org/wiki/Media_type)
    size_in_bytes?: number;
}

interface Metadata {
    proof: string; // transaction, url, etc.
    platform: ItemPlatform;
    from?: string;
    to?: string;
    id: string; // unique id, eg: ${token_address}-${token_id}
}

interface Filters {
    blocklist?: string[];
    allowlist?: string[];
}

interface LinksSet {
    identifiers?: {
        type: LinkType;
        identifier_custom: CustomLinkListURI;
        identifier: AggregatedLinkListURI;
    }[];
    identifier_back: BacklinkListURI;
    filters?: Filters;
}

// RSS3 index files, main entrance for a instance
interface Index extends SignedBase, UnsignedBase {
    identifier: InstanceURI;

    profile?: {
        name?: string;
        avatars?: URI[];
        bio?: string;
        attachments?: Attachment[];

        accounts?: {
            identifier: InstanceURI;
            signature?: string; // Signature of `[RSS3] I am adding ${identifier} to my RSS3 instance ${InstanceURI}`
        }[];

        tags?: (AutoAssetType | AutoNoteType | string)[];
        metadata?: Metadata;
    };

    links: LinksSet;

    items: {
        notes: {
            identifier_custom?: CustomItemListURI;
            identifier: AggregatedItemListURI;
            filters?: Filters;
        };
        assets: {
            identifier_custom?: CustomItemListURI;
            identifier: AggregatedItemListURI;
            filters?: Filters;
        };
    };
}

// items
type Item = {
    identifier: ItemURI;
    date_created: string; // Specifies the published date in RFC 3339 format
    date_updated: string; // Specifies the modified date in RFC 3339 format

    auto?: true; // For auto items
    identifier_instance?: InstanceURI;

    links: LinksSet;

    tags?: (AutoAssetType | AutoNoteType | string)[];
    authors: InstanceURI[];
    title?: string;
    summary?: string;
    attachments?: Attachment[];

    metadata?: Metadata;
};

// RSS3 list files
type ListBase<URIType, ElementType> = {
    identifier: URIType;
    identifier_next?: URIType;
    list?: ElementType[];
}

type CustomItemList = SignedBase & ListBase<CustomItemListURI, Item>;
type AggregatedItemList = UnsignedBase & ListBase<AggregatedItemListURI, Item>;

type CustomLinkList = SignedBase & ListBase<CustomLinkListURI, InstanceURI | ItemURI>;
type AggregatedLinkList = UnsignedBase & ListBase<AggregatedLinkListURI, InstanceURI | ItemURI>;
type BacklinksList = UnsignedBase & ListBase<BacklinkListURI, InstanceURI | ItemURI>;
