// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HerbalCollection
 * @dev Smart contract for immutable logging of herbal collections
 */
contract HerbalCollection {
    
    struct Collection {
        string recordId;
        string herbType;
        uint256 quantity; // in grams
        string latitude;
        string longitude;
        uint256 timestamp;
        address logger;
    }
    
    // Mapping from record ID to collection data
    mapping(string => Collection) public collections;
    
    // Array to store all record IDs for enumeration
    string[] public recordIds;
    
    // Events
    event CollectionLogged(
        string indexed recordId,
        string herbType,
        uint256 quantity,
        string latitude,
        string longitude,
        uint256 timestamp,
        address logger
    );
    
    // Modifier to prevent duplicate records
    modifier notExists(string memory recordId) {
        require(
            bytes(collections[recordId].recordId).length == 0,
            "Record already exists"
        );
        _;
    }
    
    /**
     * @dev Log a new herbal collection to the blockchain
     * @param _recordId Unique identifier from the backend system
     * @param _herbType Type of herb collected
     * @param _quantity Quantity collected in grams
     * @param _latitude GPS latitude as string
     * @param _longitude GPS longitude as string  
     * @param _timestamp Unix timestamp of collection
     */
    function logCollection(
        string memory _recordId,
        string memory _herbType,
        uint256 _quantity,
        string memory _latitude,
        string memory _longitude,
        uint256 _timestamp
    ) public notExists(_recordId) {
        
        require(bytes(_recordId).length > 0, "Record ID required");
        require(bytes(_herbType).length > 0, "Herb type required");
        require(_quantity > 0, "Quantity must be positive");
        require(bytes(_latitude).length > 0, "Latitude required");
        require(bytes(_longitude).length > 0, "Longitude required");
        require(_timestamp > 0, "Timestamp required");
        
        // Store collection data
        collections[_recordId] = Collection({
            recordId: _recordId,
            herbType: _herbType,
            quantity: _quantity,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: _timestamp,
            logger: msg.sender
        });
        
        // Add to enumerable list
        recordIds.push(_recordId);
        
        // Emit event
        emit CollectionLogged(
            _recordId,
            _herbType,
            _quantity,
            _latitude,
            _longitude,
            _timestamp,
            msg.sender
        );
    }
    
    /**
     * @dev Get collection data by record ID
     * @param _recordId The record ID to query
     * @return Collection struct containing all data
     */
    function getCollection(string memory _recordId) 
        public 
        view 
        returns (Collection memory) {
        require(
            bytes(collections[_recordId].recordId).length > 0,
            "Record not found"
        );
        return collections[_recordId];
    }
    
    /**
     * @dev Get total number of collections logged
     * @return Total count of collections
     */
    function getTotalCollections() public view returns (uint256) {
        return recordIds.length;
    }
    
    /**
     * @dev Get record ID by index (for enumeration)
     * @param index The index to query
     * @return Record ID at the given index
     */
    function getRecordIdByIndex(uint256 index) 
        public 
        view 
        returns (string memory) {
        require(index < recordIds.length, "Index out of bounds");
        return recordIds[index];
    }
    
    /**
     * @dev Verify if a record exists on blockchain
     * @param _recordId The record ID to check
     * @return True if record exists, false otherwise
     */
    function recordExists(string memory _recordId) 
        public 
        view 
        returns (bool) {
        return bytes(collections[_recordId].recordId).length > 0;
    }
}