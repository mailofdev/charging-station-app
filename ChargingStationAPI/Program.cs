using Microsoft.EntityFrameworkCore;
using ChargingStationAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Configure database connection using PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add API controllers
builder.Services.AddControllers();

// Configure CORS to allow all origins, methods, and headers (for development)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Swagger/OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Charging Station Management API",
        Version = "v1",
        Description = "API for managing electric vehicle charging stations"
    });
    
    // Include XML comments in Swagger documentation if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

// Initialize database and create tables if they don't exist
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        if (context.Database.CanConnect())
        {
            context.Database.EnsureCreated(); // Create database and tables if needed
            logger.LogInformation("Database initialized successfully");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error initializing database");
    }
}

// Configure middleware pipeline
app.UseCors("AllowAll"); // Enable CORS

// Enable Swagger UI at /swagger endpoint
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Charging Station API v1");
    c.RoutePrefix = "swagger";
    c.DisplayRequestDuration();
});

app.UseHttpsRedirection(); // Redirect HTTP to HTTPS
app.MapControllers(); // Map all controller routes

app.Run(); // Start the application
