using Microsoft.EntityFrameworkCore;
using ChargingStationAPI.Models;

namespace ChargingStationAPI.Data;

// Database context for Entity Framework Core
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Database table for charging stations
    public DbSet<ChargingStation> ChargingStations { get; set; }

    // Configure entity properties and constraints
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ChargingStation>(entity =>
        {
            entity.HasKey(e => e.Id); // Set Id as primary key

            // Station name is required with max 200 characters
            entity.Property(e => e.StationName)
                .IsRequired()
                .HasMaxLength(200);

            // Location address is required with max 500 characters
            entity.Property(e => e.LocationAddress)
                .IsRequired()
                .HasMaxLength(500);

            // Set default timestamp for CreatedAt field
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Create index on Status for faster queries
            entity.HasIndex(e => e.Status);
        });
    }
}
