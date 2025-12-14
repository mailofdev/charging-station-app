using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChargingStationAPI.Data;
using ChargingStationAPI.Models;

namespace ChargingStationAPI.Controllers;

[ApiController]
[Route("api")] // Base route for all endpoints in this controller
[Produces("application/json")] // All responses return JSON
public class ChargingStationsController : ControllerBase
{
    private readonly ApplicationDbContext _context; // Database context for data access
    private readonly ILogger<ChargingStationsController> _logger; // Logger for error tracking

    public ChargingStationsController(ApplicationDbContext context, ILogger<ChargingStationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// getAllChargingStations - Get all data
    /// </summary>
    [HttpGet("getAllChargingStations", Name = "GetAllChargingStations")]
    [ProducesResponseType(typeof(IEnumerable<ChargingStation>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ChargingStation>>> GetAllChargingStations()
    {
        try
        {
            // Fetch all stations ordered by name, using AsNoTracking for read-only performance
            var stations = await _context.ChargingStations
                .AsNoTracking()
                .OrderBy(s => s.StationName)
                .ToListAsync();

            return Ok(stations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving charging stations");
            return StatusCode(500, "An error occurred while retrieving charging stations");
        }
    }

    /// <summary>
    /// GetChargingStationById - Get single data
    /// </summary>
    [HttpGet("GetChargingStationById/{id}", Name = "GetChargingStationById")]
    [ProducesResponseType(typeof(ChargingStation), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChargingStation>> GetChargingStationById(int id)
    {
        try
        {
            // Find station by ID, return null if not found
            var station = await _context.ChargingStations
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);

            if (station == null)
            {
                return NotFound($"Charging station with ID {id} not found.");
            }

            return Ok(station);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving charging station with ID {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the charging station");
        }
    }

    /// <summary>
    /// AddChargingStation - Add new
    /// </summary>
    [HttpPost("AddChargingStation", Name = "AddChargingStation")]
    [ProducesResponseType(typeof(ChargingStation), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChargingStation>> AddChargingStation(ChargingStation station)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(station.StationName))
            {
                return BadRequest("StationName is required.");
            }

            if (string.IsNullOrWhiteSpace(station.LocationAddress))
            {
                return BadRequest("LocationAddress is required.");
            }

            // Set creation timestamp if not provided
            if (station.CreatedAt == default)
            {
                station.CreatedAt = DateTime.UtcNow;
            }

            // Add new station to database
            _context.ChargingStations.Add(station);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetChargingStationById),
                new { id = station.Id },
                station);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating charging station");
            return StatusCode(500, "An error occurred while creating the charging station");
        }
    }

    /// <summary>
    /// updateChargingStationById - Update data
    /// </summary>
    [HttpPut("updateChargingStationById/{id}", Name = "UpdateChargingStationById")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateChargingStationById(int id, ChargingStation station)
    {
        try
        {
            // Validate that URL ID matches request body ID
            if (id != station.Id)
            {
                return BadRequest("ID in URL does not match ID in request body.");
            }

            // Validate required fields
            if (string.IsNullOrWhiteSpace(station.StationName))
            {
                return BadRequest("StationName is required.");
            }

            if (string.IsNullOrWhiteSpace(station.LocationAddress))
            {
                return BadRequest("LocationAddress is required.");
            }

            // Find existing station to update
            var existingStation = await _context.ChargingStations.FindAsync(id);
            if (existingStation == null)
            {
                return NotFound($"Charging station with ID {id} not found.");
            }

            // Update all station properties
            existingStation.StationName = station.StationName;
            existingStation.LocationAddress = station.LocationAddress;
            existingStation.PinCode = station.PinCode;
            existingStation.ConnectorType = station.ConnectorType;
            existingStation.Status = station.Status;
            existingStation.ImageUrl = station.ImageUrl;
            existingStation.LocationLink = station.LocationLink;

            // Save changes to database
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating charging station with ID {Id}", id);
            return StatusCode(500, "An error occurred while updating the charging station");
        }
    }

    /// <summary>
    /// deleteChargingStationById - Delete data
    /// </summary>
    [HttpDelete("deleteChargingStationById/{id}", Name = "DeleteChargingStationById")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteChargingStationById(int id)
    {
        try
        {
            // Find station to delete
            var station = await _context.ChargingStations.FindAsync(id);
            if (station == null)
            {
                return NotFound($"Charging station with ID {id} not found.");
            }

            // Remove station from database
            _context.ChargingStations.Remove(station);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting charging station with ID {Id}", id);
            return StatusCode(500, "An error occurred while deleting the charging station");
        }
    }
}
