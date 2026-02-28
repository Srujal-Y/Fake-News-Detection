// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NewsRegistry
 * @notice A decentralized registry to store news article hashes, sources, and audit trails for edits.
 * @dev Each news entry stores a keccak256 hash of its content and maintains a history of edits.
 */
contract NewsRegistry {
    // ========== State Variables ==========
    address public owner;
    uint256 public nextId;

    // ========== Structs ==========
    struct Edit {
        uint256 timestamp;
        bytes32 previousHash;
        address editor;
        string note; // Optional short note describing the edit
    }

    struct News {
        bytes32 currentHash;    // keccak256 hash of the content
        string sourceUrl;       // IPFS or HTTP source link
        address creator;        // Who created the news entry
        uint256 createdAt;      // Timestamp of creation
        Edit[] edits;           // Array of all edits
        bool exists;            // Existence flag
    }

    // ========== Mappings ==========
    mapping(uint256 => News) private newsItems; // newsId => News

    // ========== Events ==========
    event NewsAdded(
        uint256 indexed newsId,
        bytes32 hash,
        string sourceUrl,
        address indexed creator
    );

    event NewsEdited(
        uint256 indexed newsId,
        bytes32 newHash,
        bytes32 previousHash,
        address indexed editor,
        string note
    );

    // ========== Modifiers ==========
    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier newsExists(uint256 _newsId) {
        require(newsItems[_newsId].exists, "news not found");
        _;
    }

    // ========== Constructor ==========
    constructor() {
        owner = msg.sender;
        nextId = 1;
    }

    // ========== Core Functions ==========

    /**
     * @notice Add a new news entry
     * @param _hash keccak256 hash of the news content
     * @param _sourceUrl URL or IPFS link to the news source
     * @return newsId The assigned news ID
     */
    function addNews(bytes32 _hash, string calldata _sourceUrl)
        external
        returns (uint256 newsId)
    {
        newsId = nextId++;
        News storage n = newsItems[newsId];

        n.currentHash = _hash;
        n.sourceUrl = _sourceUrl;
        n.creator = msg.sender;
        n.createdAt = block.timestamp;
        n.exists = true;

        emit NewsAdded(newsId, _hash, _sourceUrl, msg.sender);
    }

    /**
     * @notice Edit an existing news entry (adds to audit trail)
     * @param _newsId The ID of the news item to edit
     * @param _newHash The new keccak256 content hash
     * @param _note Optional short note describing the edit
     */
    function editNews(
        uint256 _newsId,
        bytes32 _newHash,
        string calldata _note
    ) external newsExists(_newsId) {
        News storage n = newsItems[_newsId];
        bytes32 prev = n.currentHash;

        n.edits.push(
            Edit({
                timestamp: block.timestamp,
                previousHash: prev,
                editor: msg.sender,
                note: _note
            })
        );

        n.currentHash = _newHash;

        emit NewsEdited(_newsId, _newHash, prev, msg.sender, _note);
    }

    // ========== View Functions ==========

    /**
     * @notice Get basic metadata of a news entry
     * @param _newsId The ID of the news entry
     * @return currentHash The current hash of the news
     * @return sourceUrl The source URL/IPFS
     * @return creator The creator’s address
     * @return createdAt The timestamp of creation
     * @return editCount The number of edits
     */
    function getNewsMeta(uint256 _newsId)
        external
        view
        newsExists(_newsId)
        returns (
            bytes32 currentHash,
            string memory sourceUrl,
            address creator,
            uint256 createdAt,
            uint256 editCount
        )
    {
        News storage n = newsItems[_newsId];
        return (n.currentHash, n.sourceUrl, n.creator, n.createdAt, n.edits.length);
    }

    /**
     * @notice Get a specific edit by index
     * @param _newsId The ID of the news item
     * @param index The index of the edit
     * @return timestamp The time of the edit
     * @return previousHash The previous content hash
     * @return editor The address of the editor
     * @return note The edit note
     */
    function getEdit(uint256 _newsId, uint256 index)
        external
        view
        newsExists(_newsId)
        returns (
            uint256 timestamp,
            bytes32 previousHash,
            address editor,
            string memory note
        )
    {
        News storage n = newsItems[_newsId];
        require(index < n.edits.length, "edit index OOB");
        Edit storage e = n.edits[index];
        return (e.timestamp, e.previousHash, e.editor, e.note);
    }

    /**
     * @notice Get the number of edits for a given news item
     * @param _newsId The ID of the news item
     */
    function getEditCount(uint256 _newsId)
        external
        view
        newsExists(_newsId)
        returns (uint256)
    {
        return newsItems[_newsId].edits.length;
    }

    /**
     * @notice Get the total number of news entries created
     */
    function getTotalNews() external view returns (uint256) {
        return nextId - 1;
    }
}
