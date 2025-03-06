using Microsoft.EntityFrameworkCore;
using backend.Context;
using CloudinaryDotNet;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//Crear variable para cadena de conexión
var connectionString = builder.Configuration.GetConnectionString("CadenaConeccion");

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary");
var cloudinary = new Cloudinary(new Account(
     cloudinaryConfig["CloudName"],
     cloudinaryConfig["ApiKey"],
     cloudinaryConfig["ApiSecret"]
));

builder.Services.AddSingleton(cloudinary);
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Permitir el uso de cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", app =>
    {
        app.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NuevaPolitica");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
