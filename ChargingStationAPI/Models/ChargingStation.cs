namespace ChargingStationAPI.Models;

// Model representing a charging station entity
public class ChargingStation
{
    public int Id { get; set; } // Primary key
    public string StationName { get; set; } = string.Empty; // Required: Name of the charging station
    public string LocationAddress { get; set; } = string.Empty; // Required: Full address of the station
    public string? PinCode { get; set; } // Optional: Postal/ZIP code
    public string? ConnectorType { get; set; } // Optional: Type of connector (e.g., CCS, Type 2)
    public string? Status { get; set; } // Optional: Current status (e.g., Operational, Maintenance)
    public string? ImageUrl { get; set; } // Optional: URL or base64 string for station image
    public string? LocationLink { get; set; } // Optional: Link to map location (e.g., Google Maps)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Timestamp when record was created
}
